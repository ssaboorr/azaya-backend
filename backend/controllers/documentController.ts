import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Document, User } from '../models';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private (Uploader only)
 const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, signerEmail, signatureFields } = req.body;
  console.log("upload hit")
  if (!title || !signerEmail) {
    res.status(400);
    throw new Error('Please provide title and signer email');
  }
  
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a PDF document');
  }
  
  // Find the assigned signer
  const signer = await User.findOne({ email: signerEmail, role: 'signer', isActive: true });
  if (!signer) {
    res.status(400);
    throw new Error('Signer not found or not active');
  }
  
  try {
    // Upload PDF to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'azaya-documents',
          format: 'pdf',
          public_id: `doc_${Date.now()}_${req.file!.originalname.replace(/\.[^/.]+$/, "")}`,
          pages: true, 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file!.buffer);
    }) as any;
    
    // Parse signature fields if provided
    let parsedSignatureFields = [];
    if (signatureFields) {
      try {
        parsedSignatureFields = JSON.parse(signatureFields);
      } catch (error) {
        res.status(400);
        throw new Error('Invalid signature fields format');
      }
    }
    
    // Create document record in database
    const document = await Document.create({
      title,
      originalFileName: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      uploader: req.user!.id,
      assignedSigner: signer._id,
      signerEmail: signer.email,
      signatureFields: parsedSignatureFields,
      status: 'pending'
    });
    
    // Populate the document with user details
    const populatedDocument = await Document.findById(document._id)
      .populate('uploader', 'name email role')
      .populate('assignedSigner', 'name email role');
    
    res.status(201).json({
      success: true,
      data: populatedDocument,
      message: 'Document uploaded successfully'
    });
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500);
    throw new Error('Failed to upload document to cloud storage');
  }
});

// @desc    Get all documents (uploader sees own, signer sees assigned)
// @route   GET /api/documents
// @access  Private
 const getDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  let filter: any = {};
  
  // Filter based on user role
  if (req.user!.role === 'uploader') {
    filter.uploader = req.user!.id;
  } else if (req.user!.role === 'signer') {
    filter.assignedSigner = req.user!.id;
  }
  
  // Add status filter if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  const documents = await Document.find(filter)
    .populate('uploader', 'name email role')
    .populate('assignedSigner', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Document.countDocuments(filter);
  
  res.json({
    success: true,
    data: documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
 const getDocumentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const document = await Document.findById(req.params.id)
    .populate('uploader', 'name email role')
    .populate('assignedSigner', 'name email role');
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check if user can access this document
  const canAccess = 
    document.uploader._id.toString() === req.user!.id ||
    document.assignedSigner._id.toString() === req.user!.id;
  
  if (!canAccess) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  res.json({
    success: true,
    data: document
  });
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private (Uploader only)
 const updateDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, signerEmail, signatureFields } = req.body;
  
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check if user owns this document
  if (document.uploader.toString() !== req.user!.id) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  // Cannot update signed documents
  if (document.status === 'signed' || document.status === 'verified') {
    res.status(400);
    throw new Error('Cannot update signed or verified documents');
  }
  
  // Update signer if email is provided
  if (signerEmail && signerEmail !== document.signerEmail) {
    const signer = await User.findOne({ email: signerEmail, role: 'signer', isActive: true });
    if (!signer) {
      res.status(400);
      throw new Error('Signer not found or not active');
    }
    document.assignedSigner = signer._id;
    document.signerEmail = signer.email;
  }
  
  // Update other fields
  if (title) document.title = title;
  if (signatureFields) {
    try {
      document.signatureFields = JSON.parse(signatureFields);
    } catch (error) {
      res.status(400);
      throw new Error('Invalid signature fields format');
    }
  }
  
  const updatedDocument = await document.save();
  
  // Populate and return updated document
  const populatedDocument = await Document.findById(updatedDocument._id)
    .populate('uploader', 'name email role')
    .populate('assignedSigner', 'name email role');
  
  res.json({
    success: true,
    data: populatedDocument,
    message: 'Document updated successfully'
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Uploader only)
 const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const document = await Document.findById(req.params.id);
  
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  
  // Check if user owns this document
  if (document.uploader.toString() !== req.user!.id) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  // Cannot delete signed documents
  if (document.status === 'signed' || document.status === 'verified') {
    res.status(400);
    throw new Error('Cannot delete signed or verified documents');
  }
  
  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.cloudinaryPublicId);
    
    // Delete from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500);
    throw new Error('Failed to delete document');
  }
});

// @desc    Get documents by uploader
// @route   GET /api/documents/uploader/:uploaderId
// @access  Private
const getDocumentsByUploader = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { uploaderId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate uploaderId
    if (!uploaderId) {
      res.status(400);
      throw new Error('Uploader ID is required');
    }

    console.log("uploaderId", uploaderId);

    // Build query
    const query: any = { uploader: uploaderId };
    
    // Add status filter if provided
    if (status && ['pending', 'signed', 'verified', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get documents with pagination
    const documents = await Document.find(query)
      .populate('uploader', 'name email')
      .populate('assignedSigner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocuments: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${documents.length} documents for uploader`
    });
  } catch (error) {
    console.error('Error fetching documents by uploader:', error);
    res.status(500);
    throw new Error('Failed to fetch documents by uploader');
  }
});

// @desc    Get documents by uploader
// @route   GET /api/documents/uploader/:uploaderId
// @access  Private
const getDocumentsBySigner = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { signerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate uploaderId
    if (!signerId) {
      res.status(400);
      throw new Error('Uploader ID is required');
    }

    console.log("signerId", signerId);

    // Build query
    const query: any = { assignedSigner: signerId };
    
    // Add status filter if provided
    if (status && ['pending', 'signed', 'verified', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get documents with pagination
    const documents = await Document.find(query)
      .populate('uploader', 'name email')
      .populate('assignedSigner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocuments: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${documents.length} documents for uploader`
    });
  } catch (error) {
    console.error('Error fetching documents by uploader:', error);
    res.status(500);
    throw new Error('Failed to fetch documents by uploader');
  }
});

// @desc    Get documents by current user (uploader)
// @route   GET /api/documents/my-documents
// @access  Private
const getMyDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build query for current user's documents
    const query: any = { uploader: req.user!.id };
    
    // Add status filter if provided
    if (status && ['pending', 'signed', 'verified', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get documents with pagination
    const documents = await Document.find(query)
      .populate('uploader', 'name email')
      .populate('assignedSigner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocuments: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: `Found ${documents.length} of your documents`
    });
  } catch (error) {
    console.error('Error fetching my documents:', error);
    res.status(500);
    throw new Error('Failed to fetch your documents');
  }
});

export {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentsByUploader,
  getMyDocuments,
  getDocumentsBySigner
};
