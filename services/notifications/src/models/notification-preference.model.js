import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  email: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: {
      project: {
        type: Boolean,
        default: true
      },
      bid: {
        type: Boolean,
        default: true
      },
      message: {
        type: Boolean,
        default: true
      },
      payment: {
        type: Boolean,
        default: true
      },
      review: {
        type: Boolean,
        default: true
      },
      milestone: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      },
      'counter-offer': {
        type: Boolean,
        default: true
      },
      'bid-accepted': {
        type: Boolean,
        default: true
      },
      'bid-rejected': {
        type: Boolean,
        default: true
      },
      conversation: {
        type: Boolean,
        default: true
      },
      feedback: {
        type: Boolean,
        default: true
      },
      other: {
        type: Boolean,
        default: true
      }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'immediate'
    }
  },
  sms: {
    enabled: {
      type: Boolean,
      default: false
    },
    types: {
      project: {
        type: Boolean,
        default: false
      },
      bid: {
        type: Boolean,
        default: false
      },
      message: {
        type: Boolean,
        default: false
      },
      payment: {
        type: Boolean,
        default: true
      },
      review: {
        type: Boolean,
        default: false
      },
      milestone: {
        type: Boolean,
        default: false
      },
      system: {
        type: Boolean,
        default: false
      },
      'counter-offer': {
        type: Boolean,
        default: false
      },
      'bid-accepted': {
        type: Boolean,
        default: true
      },
      'bid-rejected': {
        type: Boolean,
        default: false
      },
      conversation: {
        type: Boolean,
        default: false
      },
      feedback: {
        type: Boolean,
        default: false
      },
      other: {
        type: Boolean,
        default: false
      }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'never'],
      default: 'immediate'
    }
  },
  inApp: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: {
      project: {
        type: Boolean,
        default: true
      },
      bid: {
        type: Boolean,
        default: true
      },
      message: {
        type: Boolean,
        default: true
      },
      payment: {
        type: Boolean,
        default: true
      },
      review: {
        type: Boolean,
        default: true
      },
      milestone: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      },
      'counter-offer': {
        type: Boolean,
        default: true
      },
      'bid-accepted': {
        type: Boolean,
        default: true
      },
      'bid-rejected': {
        type: Boolean,
        default: true
      },
      conversation: {
        type: Boolean,
        default: true
      },
      feedback: {
        type: Boolean,
        default: true
      },
      other: {
        type: Boolean,
        default: true
      }
    }
  },
  push: {
    enabled: {
      type: Boolean,
      default: false
    },
    types: {
      project: {
        type: Boolean,
        default: false
      },
      bid: {
        type: Boolean,
        default: false
      },
      message: {
        type: Boolean,
        default: true
      },
      payment: {
        type: Boolean,
        default: false
      },
      review: {
        type: Boolean,
        default: false
      },
      milestone: {
        type: Boolean,
        default: false
      },
      system: {
        type: Boolean,
        default: false
      },
      'counter-offer': {
        type: Boolean,
        default: false
      },
      'bid-accepted': {
        type: Boolean,
        default: false
      },
      'bid-rejected': {
        type: Boolean,
        default: false
      },
      conversation: {
        type: Boolean,
        default: true
      },
      feedback: {
        type: Boolean,
        default: false
      },
      other: {
        type: Boolean,
        default: false
      }
    }
  },
  doNotDisturb: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      default: '22:00' // 10 PM
    },
    endTime: {
      type: String,
      default: '08:00' // 8 AM
    },
    timezone: {
      type: String,
      default: 'Asia/Karachi' // Pakistan timezone
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

// Transform the document when converting to JSON
notificationPreferenceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

export default NotificationPreference;
