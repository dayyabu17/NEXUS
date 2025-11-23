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

// Check File Type
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

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Max file size 1MB
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePicture'); // 'profilePicture' is the field name expected in the form

module.exports = upload;