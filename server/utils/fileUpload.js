const multer = require('multer');
const path = require('path');

/**
 * @module utils/fileUpload
 * @description Configuration for handling file uploads using Multer.
 */

// Set storage engine for Multer
const storage = multer.diskStorage({
  /**
   * Sets the destination directory for uploaded files.
   * @param {Object} req - The Express request object.
   * @param {Object} file - The file object being uploaded.
   * @param {Function} cb - Callback function to set the destination.
   */
  destination: './public/uploads/profile_pics/', // Directory where files will be stored
  /**
   * Generates a unique filename for the uploaded file.
   * Format: fieldname-timestamp.extension
   * @param {Object} req - The Express request object.
   * @param {Object} file - The file object being uploaded.
   * @param {Function} cb - Callback function to set the filename.
   */
  filename: function(req, file, cb){
    // Ensure unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

/**
 * Checks if the uploaded file is of a valid image type (jpeg, jpg, png, gif).
 *
 * @function checkFileType
 * @param {Object} file - The file object to check.
 * @param {Function} cb - Callback function to return the result.
 * @returns {void}
 */
function checkFileType(file, cb){
  // Allowed ext (extensions)
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only (jpeg, jpg, png, gif)!');
  }
}

/**
 * Multer upload middleware instance configured for single file upload.
 * Validates file type and limits size to 1MB.
 * Expects the form field name to be 'profilePicture'.
 *
 * @type {multer.Instance}
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Max file size 1MB
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePicture'); // 'profilePicture' is the field name expected in the form

module.exports = upload;
