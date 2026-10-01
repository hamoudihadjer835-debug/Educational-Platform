const { upload } = require('../config/uploadConfig');

// This middleware uses Multer for local file storage
// The upload configuration is in ../config/uploadConfig.js

module.exports = upload;
