const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const File = require('../models/File');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'temp_uploads/' });
const STORAGE_DIR = path.join(__dirname, '..', 'hdfs_storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// POST /api/files/upload
router.post('/upload', auth, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { folderId, isEncrypted } = req.body;
    const uploadedFiles = [];
    const shouldEncrypt = isEncrypted === undefined || isEncrypted === 'true';

    for (const file of req.files) {
      const { originalname, mimetype, size, path: tempPath } = file;

    let ivHex = undefined;
    let iv = null;

    if (shouldEncrypt) {
      iv = crypto.randomBytes(16);
      ivHex = iv.toString('hex');
    }

      const newFile = new File({
        originalName: originalname,
        mimeType: mimetype,
        size: size,
        chunks: [],
        iv: ivHex,
        isEncrypted: shouldEncrypt,
        uploadedBy: req.user.id,
        folderId: folderId || null
      });
    
    // Initial save to get the _id, this will now pass validation
    await newFile.save();

    const fileId = newFile._id.toString();
    const storedFileName = `${fileId}_data`;
    const storedFilePath = path.join(STORAGE_DIR, storedFileName);

    // Stream encryption or copy
    const readStream = fs.createReadStream(tempPath);
    const writeStream = fs.createWriteStream(storedFilePath);
    
    await new Promise((resolve, reject) => {
      if (shouldEncrypt) {
        const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        readStream.pipe(cipher).pipe(writeStream);
        cipher.on('error', reject);
      } else {
        readStream.pipe(writeStream);
      }
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      readStream.on('error', reject);
    });

    // Remove the temporary uploaded file
    fs.unlinkSync(tempPath);

      // Update the file document with the chunk info
      newFile.chunks = [storedFileName];
      await newFile.save();
      uploadedFiles.push(newFile);
    }

    res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload and process file' });
  }
});

// GET /api/files
router.get('/', auth, async (req, res) => {
  try {
    const { folderId, search, type, sort } = req.query;
    
    let query = { uploadedBy: req.user.id };
    
    if (folderId !== undefined) {
      query.folderId = folderId === 'root' || folderId === '' ? null : folderId;
    }

    if (search) {
      query.originalName = { $regex: search, $options: 'i' };
    }

    if (type) {
      query.mimeType = { $regex: type, $options: 'i' };
    }

    let sortOption = { uploadDate: -1 };
    if (sort === 'date_asc') sortOption = { uploadDate: 1 };
    if (sort === 'size_desc') sortOption = { size: -1 };
    if (sort === 'size_asc') sortOption = { size: 1 };

    const files = await File.find(query).sort(sortOption);
    res.status(200).json(files);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// GET /api/files/:id (Metadata)
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(200).json(file);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch file metadata' });
  }
});

// GET /api/files/download/:id
router.get('/download/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const chunkName = file.chunks[0];
    const chunkPath = path.join(STORAGE_DIR, chunkName);

    if (!fs.existsSync(chunkPath)) {
      return res.status(404).json({ error: 'File data not found on server' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);

    // Stream decryption or copy
    const readStream = fs.createReadStream(chunkPath);
    
    if (file.isEncrypted !== false) {
      const iv = Buffer.from(file.iv, 'hex');
      const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      readStream.pipe(decipher).pipe(res);

      decipher.on('error', (error) => {
        console.error('Decipher Error:', error);
        if (!res.headersSent) res.status(500).end();
      });
    } else {
      readStream.pipe(res);
    }

    readStream.on('error', (error) => {
      console.error('Read Stream Error:', error);
      if (!res.headersSent) res.status(500).end();
    });

  } catch (error) {
    console.error('Download Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  }
});

// DELETE /api/files/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete chunks from storage
    for (const chunkName of file.chunks) {
      const chunkPath = path.join(STORAGE_DIR, chunkName);
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }

    // Delete document from DB
    await File.deleteOne({ _id: file._id });

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// POST /api/files/:id/share
router.post('/:id/share', auth, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.isPublic) {
      file.isPublic = true;
      file.shareToken = crypto.randomBytes(16).toString('hex');
      await file.save();
    }

    res.status(200).json({ shareToken: file.shareToken, isPublic: file.isPublic });
  } catch (error) {
    console.error('Share Error:', error);
    res.status(500).json({ error: 'Failed to share file' });
  }
});

module.exports = router;
