const fs = require('fs');
const path = require('path');
const { encryptChunk, decryptChunk } = require('./cryptoUtils');
const crypto = require('crypto');

const CHUNK_SIZE = 1024 * 1024; // 1MB
const STORAGE_DIR = path.join(__dirname, '..', 'hdfs_storage');

/**
 * Splits a file into 1MB chunks, encrypts each chunk, and saves it.
 * @param {string} filePath - Path to the original uploaded file
 * @param {string} fileId - Unique identifier for the file (e.g. Mongoose ObjectId)
 * @returns {Object} { chunks: string[], iv: string }
 */
const splitAndEncryptFile = async (filePath, fileId) => {
  const chunks = [];
  const iv = crypto.randomBytes(16); // Generate a random IV for this file
  
  const fileBuffer = fs.readFileSync(filePath);
  const totalChunks = Math.ceil(fileBuffer.length / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileBuffer.length);
    const chunkData = fileBuffer.subarray(start, end);

    // Encrypt the chunk
    const encryptedChunk = encryptChunk(chunkData, iv);

    // Save to hdfs_storage
    const chunkName = `${fileId}_chunk_${i}`;
    const chunkPath = path.join(STORAGE_DIR, chunkName);
    fs.writeFileSync(chunkPath, encryptedChunk);
    
    chunks.push(chunkName);
  }

  // Remove the original temporary uploaded file
  fs.unlinkSync(filePath);

  return { chunks, iv: iv.toString('hex') };
};

/**
 * Streams the decrypted file chunks.
 * @param {Array<string>} chunks - List of chunk filenames
 * @param {string} ivHex - Hex string of the IV used for encryption
 * @param {object} res - Express response object to stream to
 */
const streamDecryptedFile = (chunks, ivHex, res) => {
  const iv = Buffer.from(ivHex, 'hex');

  for (const chunkName of chunks) {
    const chunkPath = path.join(STORAGE_DIR, chunkName);
    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Chunk missing: ${chunkName}`);
    }

    const encryptedChunk = fs.readFileSync(chunkPath);
    const decryptedChunk = decryptChunk(encryptedChunk, iv);

    res.write(decryptedChunk);
  }

  res.end();
};

module.exports = {
  splitAndEncryptFile,
  streamDecryptedFile
};
