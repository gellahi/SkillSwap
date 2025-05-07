import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Category description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    default: 'default-icon'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Transform the document when converting to JSON
categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
