const multer = require('multer');
const path = require('path');

/**
 * Configuration for Multer storage engine.
 * Files are stored in './public/uploads/profile_pics/'.
 * Filenames are generated as: fieldname-timestamp.ext
 */
const storage = multer.diskStorage({
  destination: './public/uploads/profile_pics/', // Directory where files will be stored
  filename: function(req, file, cb){
    // Ensure unique filename: fieldname-timestamp.ext
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

/**
 * Checks if the uploaded file is of an allowed image type.
 * Allowed types: jpeg, jpg, png, gif.
 *
 * @function checkFileType
 * @param {Object} file - The file object to check.
 * @param {Function} cb - The callback function to return result or error.
 * @returns {void} Calls the callback with null and true if valid, or an error message if invalid.
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
 * Multer upload middleware instance.
 * Configured with storage, file size limit (1MB), and file filter.
 * Expects a single file field named 'profilePicture'.
 *
 * @type {multer.Multer}
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Max file size 1MB
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePicture'); // 'profilePicture' is the field name expected in the form

module.exports = upload;
