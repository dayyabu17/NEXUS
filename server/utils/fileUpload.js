const multer = require('multer');
const path = require('path');

// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: './public/uploads/profile_pics/', // Directory where files will be stored
  filename: function(req, file, cb){
    // Ensure unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

/**
 * Checks if the uploaded file has a valid extension and MIME type.
 *
 * @param {Object} file - The file object from Multer.
 * @param {Function} cb - The callback function to signal success or failure.
 * @returns {void}
 */
function checkFileType(file, cb){
  // Allowed ext (extensions)
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  }

  cb(new Error('Images must be jpeg, jpg, png, gif, or webp.'));
}

/**
 * Multer upload middleware configured for profile pictures.
 *
 * @description Configures storage, file size limits (2MB), and file filtering (images only).
 * Expects a single file field named 'profilePicture'.
 * @type {Function}
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size 2MB
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePicture'); // 'profilePicture' is the field name expected in the form

module.exports = upload;