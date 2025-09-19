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
  
  // Additional dynamic fields
  description?: string;
  category?: string;
  priority?: string;
  dueDate?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  notes?: string;
  customFields?: Record<string, any>;
  expiryDate?: Date;
  version?: string;
  department?: string;
  project?: string;
  client?: string;
  reference?: string;
  type?: string;
  
  // Allow any custom fields that start with 'custom_'
  [key: `custom_${string}`]: any;
  
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
  },
  
  // Additional dynamic fields
  description: {
    type: String
  },
  category: {
    type: String
  },
  priority: {
    type: String
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  },
  notes: {
    type: String
  },
  customFields: {
    type: Schema.Types.Mixed
  },
  expiryDate: {
    type: Date
  },
  version: {
    type: String
  },
  department: {
    type: String
  },
  project: {
    type: String
  },
  client: {
    type: String
  },
  reference: {
    type: String
  },
  type: {
    type: String
  }
}, {
  timestamps: true,
  strict: false // Allow additional fields not defined in schema
});

export default mongoose.model<IDocument>('Document', documentSchema);
