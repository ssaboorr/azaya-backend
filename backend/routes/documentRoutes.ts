import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentsByUploader,
  getMyDocuments,
  getDocumentsBySigner
} from '../controllers/documentController';
import { protect, uploaderOnly, uploaderOrSigner } from '../middleware/authMiddleware';
import { validatePDFUpload } from '../middleware/uploadMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private (Uploader only)
router.post('/upload', uploaderOnly, validatePDFUpload, uploadDocument);

// @desc    Get all documents (filtered by role)
// @route   GET /api/documents
// @access  Private (Uploader/Signer)
router.get('/', uploaderOrSigner, getDocuments);

// @desc    Get my documents (current user's documents)
// @route   GET /api/documents/my-documents
// @access  Private (Uploader/Signer)
router.get('/my-documents', uploaderOrSigner, getMyDocuments);

// @desc    Get documents by uploader ID
// @route   GET /api/documents/uploader/:uploaderId
// @access  Private (Uploader/Signer)
router.get('/uploader/:uploaderId', uploaderOrSigner, getDocumentsByUploader);

// @desc    Get documents by uploader ID
// @route   GET /api/documents/uploader/:uploaderId
// @access  Private (Uploader/Signer)
router.get('/signer/:signerId', uploaderOrSigner,getDocumentsBySigner);

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private (Uploader/Signer)
router.get('/:id', uploaderOrSigner, getDocumentById);

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private (Uploader only)
router.put('/:id', uploaderOnly, updateDocument);

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Uploader only)
router.delete('/:id', uploaderOnly, deleteDocument);

export default router;
