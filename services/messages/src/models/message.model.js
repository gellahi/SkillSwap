import mongoose from 'mongoose';
import crypto from 'crypto';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    hash: String, // SHA-256 hash of message content for integrity verification
    encryptionType: {
      type: String,
      enum: ['none', 'end-to-end'],
      default: 'none'
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    text: String,
    timestamp: Date
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Pre-save hook to generate hash for message integrity
messageSchema.pre('save', function(next) {
  if (this.isModified('text') || this.isNew) {
    // Generate hash of message content
    const hash = crypto
      .createHash('sha256')
      .update(`${this.sender}:${this.text}:${Date.now()}`)
      .digest('hex');
    
    this.metadata = this.metadata || {};
    this.metadata.hash = hash;
  }
  next();
});

// Indexes for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for checking if message is read by a specific user
messageSchema.virtual('isReadBy').get(function(userId) {
  return this.readBy.some(read => read.user.toString() === userId);
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = function(userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(read => read.user.toString() === userId);
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Method to verify message integrity
messageSchema.methods.verifyIntegrity = function() {
  if (!this.metadata || !this.metadata.hash) {
    return false;
  }
  
  const computedHash = crypto
    .createHash('sha256')
    .update(`${this.sender}:${this.text}:${this.createdAt.getTime()}`)
    .digest('hex');
  
  return this.metadata.hash === computedHash;
};

// Transform the document when converting to JSON
messageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    // Don't expose the hash in API responses
    if (ret.metadata && ret.metadata.hash) {
      delete ret.metadata.hash;
    }
    return ret;
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
