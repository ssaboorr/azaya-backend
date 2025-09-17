import mongoose, { Document as MongoDocument, Schema } from 'mongoose';

export interface ISignatureField {
  type: 'signature' | 'name' | 'email' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
}

export interface IDocument extends MongoDocument {
  title: string;
  originalFileName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  uploader: mongoose.Types.ObjectId;
  assignedSigner: mongoose.Types.ObjectId;
  signerEmail: string;
  signatureFields: ISignatureField[];
  status: 'pending' | 'signed' | 'verified' | 'rejected';
  signedAt?: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const signatureFieldSchema = new Schema<ISignatureField>({
  type: {
    type: String,
    enum: ['signature', 'name', 'email', 'date'],
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    required: true
  },
  required: {
    type: Boolean,
    default: true
  }
});

const documentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedSigner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signerEmail: {
    type: String,
    required: true
  },
  signatureFields: [signatureFieldSchema],
  status: {
    type: String,
    enum: ['pending', 'signed', 'verified', 'rejected'],
    default: 'pending'
  },
  signedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IDocument>('Document', documentSchema);
