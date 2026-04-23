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
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, path: tempPath } = req.file;

    // Generate a secure random IV
    const iv = crypto.randomBytes(16);
    const ivHex = iv.toString('hex');

    // Create a new file document with the IV
    const newFile = new File({
      originalName: originalname,
      mimeType: mimetype,
      size: size,
      chunks: [],
      iv: ivHex,
      uploadedBy: req.user.id
    });
    
    // Initial save to get the _id, this will now pass validation
    await newFile.save();

    const fileId = newFile._id.toString();
    const encryptedFileName = `${fileId}_encrypted`;
    const encryptedFilePath = path.join(STORAGE_DIR, encryptedFileName);

    // Stream encryption
    const readStream = fs.createReadStream(tempPath);
    const writeStream = fs.createWriteStream(encryptedFilePath);
    
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    await new Promise((resolve, reject) => {
      readStream.pipe(cipher).pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      readStream.on('error', reject);
      cipher.on('error', reject);
    });

    // Remove the temporary uploaded file
    fs.unlinkSync(tempPath);

    // Update the file document with the chunk info
    newFile.chunks = [encryptedFileName];
    await newFile.save();

    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload and process file' });
  }
});

// GET /api/files
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id }).sort({ uploadDate: -1 });
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

    // Stream decryption
    const readStream = fs.createReadStream(chunkPath);
    const iv = Buffer.from(file.iv, 'hex');
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    readStream.pipe(decipher).pipe(res);

    readStream.on('error', (error) => {
      console.error('Read Stream Error:', error);
      if (!res.headersSent) res.status(500).end();
    });

    decipher.on('error', (error) => {
      console.error('Decipher Error:', error);
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

module.exports = router;
