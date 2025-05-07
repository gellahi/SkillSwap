import User from '../models/user.model.js';
import { ApiError } from '../../../../shared/middlewares/error-handler.js';

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PATCH /api/auth/me
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, skills, location, socialLinks, phoneNumber } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (location) user.location = location;
    if (socialLinks) user.socialLinks = socialLinks;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    // Update password
    user.password = newPassword;
    // Invalidate refresh token
    user.refreshToken = null;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/auth/users/:id
 * @access Private/Admin
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/auth/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, isVerified, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 * @route PATCH /api/auth/users/:id
 * @access Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isVerified, isActive } = req.body;
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Save updated user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/auth/users/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
