const express = require('express')
const router = express.Router();

const { registerUser, loginUser, logout, forgotPassword, resetPassword , getUserProfile, updatePassword, updateProfile, allUsers, getUserDetails, updateUser, deleteUser, verifyEmail } = require('../controllers/usersController')


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logout);

router.route('/me/:id').get(getUserProfile);
router.route('/password/update').put(updatePassword);

router.route('/me/update').put(updateProfile);

router.route('/admin/users').get(allUsers);
router.route('/admin/user/:id').get(getUserDetails);
router.route('/admin/user/:id').put(updateUser);
router.route('/admin/user/:id').delete(deleteUser);

// Dodaj rutu za verifikaciju emaila
router.route('/auth/verify-email/:token').get(verifyEmail);

module.exports = router;