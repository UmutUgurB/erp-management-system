const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.ensureDirSync(uploadsDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'productImage') {
      uploadPath = path.join(uploadsDir, 'products');
    } else if (file.fieldname === 'userAvatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
  // Allow documents
  else if (file.mimetype === 'application/pdf' || 
           file.mimetype === 'application/msword' ||
           file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
           file.mimetype === 'application/vnd.ms-excel' ||
           file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  }
  // Reject other files
  else {
    cb(new Error('Desteklenmeyen dosya türü'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Specific upload configurations
const uploadProductImage = upload.single('productImage');
const uploadUserAvatar = upload.single('userAvatar');
const uploadDocument = upload.single('document');
const uploadMultiple = upload.array('files', 10); // Max 10 files

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu 5MB\'dan büyük olamaz'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Çok fazla dosya yüklendi'
      });
    }
  }
  
  if (error.message === 'Desteklenmeyen dosya türü') {
    return res.status(400).json({
      success: false,
      message: 'Desteklenmeyen dosya türü'
    });
  }
  
  next(error);
};

// File deletion utility
const deleteFile = async (filePath) => {
  try {
    await fs.remove(filePath);
    return true;
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (filename, type = 'products') => {
  return `/uploads/${type}/${filename}`;
};

module.exports = {
  uploadProductImage,
  uploadUserAvatar,
  uploadDocument,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  getFileUrl,
  uploadsDir
}; 