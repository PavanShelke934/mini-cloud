const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure key is exactly 32 bytes (256 bits). If ENCRYPTION_KEY is a hex string, parse it.
const getKey = () => {
  const keyString = process.env.ENCRYPTION_KEY;
  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable is missing');
  }
  // Convert hex string to Buffer
  const key = Buffer.from(keyString, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid encryption key length. Must be 32 bytes.');
  }
  return key;
};

/**
 * Encrypts a buffer
 * @param {Buffer} buffer - Data to encrypt
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} Encrypted data
 */
const encryptChunk = (buffer, iv) => {
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return encrypted;
};

/**
 * Decrypts a buffer
 * @param {Buffer} encryptedBuffer - Data to decrypt
 * @param {Buffer} iv - Initialization vector
 * @returns {Buffer} Decrypted data
 */
const decryptChunk = (encryptedBuffer, iv) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  return decrypted;
};

module.exports = {
  encryptChunk,
  decryptChunk
};
