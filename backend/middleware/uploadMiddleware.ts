import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for PDF uploads
const storage = multer.memoryStorage(); // Store in memory for direct upload to Cloudinary

// File filter to only allow PDF files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Middleware to validate PDF upload
export const validatePDFUpload = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is a signing request (has signedPdf field) or regular upload (has document field)
  const isSigningRequest = req.body.status === 'signed';
  const fieldName = isSigningRequest ? 'signedPdf' : 'document';
  
  const uploadSingle = upload.single(fieldName);
  
  uploadSingle(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: `Unexpected field. Expected field name: ${fieldName}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error IN middleware: ${err}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    
    // For signing requests, file is optional
    if (isSigningRequest && !req.file) {
      // No file provided for signing - this is allowed
      return next();
    }
    
    // For regular uploads, file is required
    if (!isSigningRequest && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document',
      });
    }
    
    // If file is provided, validate it
    if (req.file) {
      // Additional PDF validation
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: 'Only PDF files are allowed',
        });
      }
      
      // Check file size again (double check)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit',
        });
      }
    }
    
    next();
  });
};

export default upload;
