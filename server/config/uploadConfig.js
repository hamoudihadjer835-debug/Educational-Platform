const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Get file size limit from environment variables or use default (50MB)
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 50 * 1024 * 1024;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  // Skip uploads directory creation logging
}

// Set up disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a more readable filename that includes the original name
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Replace special chars
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    // Limit the base name length to avoid excessively long filenames
    const truncatedName = baseName.substring(0, 30);

    // Final filename format: originalname-timestamp-random.ext
    cb(null, `${truncatedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  // Get file type from request body or default to 'pdf'
  const fileType = req.body.fileType || 'pdf';

  // Skip file filter logging

  // Check if file type matches the requested type
  if (fileType === 'pdf' && (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf'))) {
    cb(null, true);
  } else if (fileType === 'video' && (file.mimetype.startsWith('video/') ||
                                     file.originalname.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i))) {
    cb(null, true);
  } else if (fileType === 'document' && (
    file.mimetype.includes('document') ||
    file.mimetype.includes('text/') ||
    file.mimetype.includes('application/vnd.ms-') ||
    file.mimetype.includes('application/vnd.openxmlformats-') ||
    file.originalname.match(/\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i)
  )) {
    cb(null, true);
  } else {
    // For development, accept any file type if the checks above fail
    // Skip file type validation logging
    cb(null, true);

    // For production, uncomment this instead:
    // cb(new Error(`Invalid file type. Expected ${fileType} but got ${file.mimetype}`), false);
  }
};

// Initialize upload middleware with disk storage and size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // Max file size from env or default
    files: 10 // Max 10 files per upload
  },
  fileFilter: fileFilter
});

// Skip file upload configuration logging

module.exports = {
  upload,
  uploadsDir
};
