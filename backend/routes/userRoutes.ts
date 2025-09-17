import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUsersByRole
} from '../controllers/userController';

const router = express.Router();

// @desc    Get all users (with pagination)
// @route   GET /api/users
// @access  Public
router.get('/', getUsers);

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Public
router.get('/role/:role', getUsersByRole);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', getUserById);

// @desc    Create new user
// @route   POST /api/users
// @access  Public
router.post('/', createUser);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
router.put('/:id', updateUser);

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Public
router.put('/:id/password', updateUserPassword);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
router.delete('/:id', deleteUser);

export default router;
