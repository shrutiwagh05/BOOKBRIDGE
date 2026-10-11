const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDirectory = path.resolve(__dirname, '../../uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
    callback(null, filename);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.has(extension) &&
    allowedMimeTypes.has(file.mimetype)
  ) {
    return callback(null, true);
  }

  callback(new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
