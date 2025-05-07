import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Project ID is required'],
    ref: 'Project'
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Freelancer ID is required'],
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid amount must be at least 1']
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Delivery time is required'],
    min: [1, 'Delivery time must be at least 1']
  },
  deliveryTimeUnit: {
    type: String,
    enum: ['hours', 'days', 'weeks', 'months'],
    default: 'days'
  },
  proposal: {
    type: String,
    required: [true, 'Proposal is required'],
    trim: true,
    minlength: [20, 'Proposal must be at least 20 characters long'],
    maxlength: [2000, 'Proposal cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'countered'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    amount: {
      type: Number,
      required: true
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'approved'],
      default: 'pending'
    }
  }],
  counterOffers: [{
    amount: {
      type: Number,
      required: true
    },
    deliveryTime: {
      type: Number,
      required: true
    },
    deliveryTimeUnit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'days'
    },
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  clientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  freelancerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  acceptedAt: Date,
  rejectedAt: Date,
  withdrawnAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
bidSchema.index({ projectId: 1 });
bidSchema.index({ freelancerId: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ createdAt: -1 });
bidSchema.index({ amount: 1 });

// Virtual for time since bid was created
bidSchema.virtual('timeSinceCreated').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diff = now - created;
  
  // Calculate days, hours, minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
});

// Transform the document when converting to JSON
bidSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
