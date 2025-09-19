import mongoose, { Document, Schema } from 'mongoose';

export interface ISignature extends Document {
  document: mongoose.Types.ObjectId;
  signer: mongoose.Types.ObjectId;
  signatureData: string; 
  signerName: string;
  signerEmail: string;
  signedDate: Date;
  ipAddress?: string;
  userAgent?: string;
  signedDocumentUrl?: string;
  signedDocumentPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const signatureSchema = new Schema<ISignature>({
  document: {
    type: Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  signer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signatureData: {
    type: String, 
    required: false
  },
  signerName: {
    type: String,
    required: true
  },
  signerEmail: {
    type: String,
    required: true
  },
  signedDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  signedDocumentUrl: {
    type: String 
  },
  signedDocumentPublicId: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<ISignature>('Signature', signatureSchema);
