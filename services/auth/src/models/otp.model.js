import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otpHash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['verification', 'password-reset', 'login'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries and to automatically delete expired OTPs
otpSchema.index({ userId: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
