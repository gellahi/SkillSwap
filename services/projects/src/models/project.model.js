import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [5, 'Project title must be at least 5 characters long'],
    maxlength: [100, 'Project title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [20, 'Project description must be at least 20 characters long'],
    maxlength: [2000, 'Project description cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    required: [true, 'Project requirements are required'],
    trim: true,
    minlength: [10, 'Project requirements must be at least 10 characters long'],
    maxlength: [1000, 'Project requirements cannot exceed 1000 characters']
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Client ID is required'],
    ref: 'User'
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [5, 'Budget must be at least 5 PKR']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX Design',
      'Graphic Design',
      'Content Writing',
      'Digital Marketing',
      'SEO',
      'Data Entry',
      'Virtual Assistant',
      'Translation',
      'Video Editing',
      'Animation',
      'Voice Over',
      'Music Production',
      'Photography',
      'Illustration',
      'Logo Design',
      'Copywriting',
      'Other'
    ]
  },
  skills: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  location: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    default: 'remote'
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 day'],
    required: [true, 'Duration is required']
  },
  durationType: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    default: 'days'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  invitedFreelancers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  bidCount: {
    type: Number,
    default: 0
  },
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  requirements: 'text' 
}, {
  weights: {
    title: 10,
    description: 5,
    requirements: 3
  },
  name: 'text_search'
});

// Virtual for time remaining until deadline
projectSchema.virtual('timeRemaining').get(function() {
  if (!this.deadline) return null;
  
  const now = new Date();
  const diff = this.deadline - now;
  
  // Return null if deadline has passed
  if (diff < 0) return null;
  
  // Calculate days, hours, minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes };
});

// Transform the document when converting to JSON
projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
