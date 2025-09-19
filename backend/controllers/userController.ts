import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models';
import bcrypt from 'bcryptjs';

// @desc    Get all users
// @route   GET /api/users
// @access  Public (for now)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (for now)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Create new user
// @route   POST /api/users
// @access  Public (for now)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Validate required fields
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, role');
  }

  // Validate role
  if (!['uploader', 'signer'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "uploader" or "signer"');
  }

  // Validate password length
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  // Return user without password
  const userResponse = await User.findById(user._id).select('-password');

  res.status(201).json({
    success: true,
    data: userResponse,
    message: 'User created successfully'
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public (for now)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }
  }

  // Validate role if provided
  if (role && !['uploader', 'signer'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "uploader" or "signer"');
  }

  // Update user fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  const updatedUser = await user.save();

  // Return updated user without password
  const userResponse = await User.findById(updatedUser._id).select('-password');

  res.json({
    success: true,
    data: userResponse,
    message: 'User updated successfully'
  });
});

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Public (for now)
export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public (for now)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Public (for now)
export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;

  if (!['uploader', 'signer'].includes(role)) {
    res.status(400);
    throw new Error('Role must be either "uploader" or "signer"');
  }

  const users = await User.find({ role, isActive: true })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users,
    count: users.length
  });
});
