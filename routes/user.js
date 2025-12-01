const express = require('express');
const router = express.Router();
const {
  registerUser,
  uploadAvatar,           // dodato
  loginUser,
  forgotPassword,
  resetPassword,
  logout,
  getUserProfile,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  verifyEmail
} = require('../controllers/usersController');

// Register user sa avatarom
router.route('/register').post(uploadAvatar, registerUser);

// Login
router.route('/login').post(loginUser);

// Forgot / Reset password
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

// Logout
router.route('/logout').get(logout);

// User profile
router.route('/me/:id').get(getUserProfile);
router.route('/me/update').put(updateProfile);
router.route('/password/update').put(updatePassword);

// Admin routes
router.route('/admin/users').get(allUsers);
router.route('/admin/user/:id').get(getUserDetails);
router.route('/admin/user/:id').put(updateUser);
router.route('/admin/user/:id').delete(deleteUser);

// Email verification
router.route('/auth/verify-email/:token').get(verifyEmail);

module.exports = router;
