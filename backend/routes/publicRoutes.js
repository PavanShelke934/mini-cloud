const express = require('express');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const STORAGE_DIR = path.join(__dirname, '..', 'hdfs_storage');

// GET /api/public/:token
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const file = await File.findOne({ shareToken: token, isPublic: true });

    if (!file) {
      return res.status(404).json({ error: 'Shared file not found or is no longer public' });
    }

    // If download is requested (query param ?download=true)
    if (req.query.download === 'true') {
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
    } else {
      // Just return metadata for preview
      res.status(200).json({
        id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        uploadDate: file.uploadDate
      });
    }
  } catch (error) {
    console.error('Public fetch error:', error);
    res.status(500).json({ error: 'Failed to access shared file' });
  }
});

module.exports = router;
