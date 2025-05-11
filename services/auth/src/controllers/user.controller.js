import User from '../models/user.model.js';
import { ApiError, logger } from '../../../../shared/middlewares/error-handler.js';
import { CacheService } from '../../../../shared/utils/index.js';

// Initialize cache service
const cache = new CacheService({
  keyPrefix: 'auth:user:'
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `profile:${userId}`;

    // Try to get user from cache
    let user = await cache.get(cacheKey);

    // If not in cache, get from database and cache it
    if (!user) {
      logger.info(`Cache miss for user profile: ${userId}`);
      user = await User.findById(userId);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Cache user data for 10 minutes
      await cache.set(cacheKey, user, 600);
    } else {
      logger.info(`Cache hit for user profile: ${userId}`);
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
    const cacheKey = `profile:${userId}`;

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

    // Update cache
    await cache.set(cacheKey, user, 600);
    logger.info(`Updated cache for user profile: ${userId}`);

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
    const cacheKey = `profile:${userId}`;

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

    // Invalidate cache since security-related data changed
    await cache.del(cacheKey);
    logger.info(`Invalidated cache for user profile after password change: ${userId}`);

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
    const cacheKey = `user:${id}`;

    // Try to get user from cache
    let user = await cache.get(cacheKey);

    // If not in cache, get from database and cache it
    if (!user) {
      logger.info(`Cache miss for user: ${id}`);
      user = await User.findById(id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Cache user data for 10 minutes
      await cache.set(cacheKey, user, 600);
    } else {
      logger.info(`Cache hit for user: ${id}`);
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

    // Create cache key based on query parameters
    const cacheKey = `users:${role || 'all'}:${isVerified || 'all'}:${page}:${limit}`;

    // Try to get results from cache
    let result = await cache.get(cacheKey);

    if (!result) {
      logger.info(`Cache miss for users list: ${cacheKey}`);

      // Execute query
      const users = await User.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      // Get total count
      const total = await User.countDocuments(query);

      result = {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      // Cache results for 5 minutes (shorter time for lists that change frequently)
      await cache.set(cacheKey, result, 300);
    } else {
      logger.info(`Cache hit for users list: ${cacheKey}`);
    }

    res.status(200).json({
      success: true,
      data: result
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
    const userCacheKey = `user:${id}`;

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

    // Update user cache
    await cache.set(userCacheKey, user, 600);
    logger.info(`Updated cache for user: ${id}`);

    // Invalidate users list cache since a user was updated
    await cache.clearByPrefix('users:');
    logger.info('Invalidated users list cache after user update');

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
    const userCacheKey = `user:${id}`;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await user.deleteOne();

    // Delete user from cache
    await cache.del(userCacheKey);
    logger.info(`Deleted user from cache: ${id}`);

    // Invalidate users list cache since a user was deleted
    await cache.clearByPrefix('users:');
    logger.info('Invalidated users list cache after user deletion');

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
