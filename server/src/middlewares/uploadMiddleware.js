const multer = require('multer');
const path = require('path');

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

// Store uploaded images in memory instead of temporary disk.
const storage = multer.memoryStorage();

// Validate the uploaded image format.
const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.has(extension) &&
    allowedMimeTypes.has(file.mimetype)
  ) {
    return callback(null, true);
  }

  callback(
    new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.')
  );
};

// Accept one image with a maximum size of 5 MB.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
