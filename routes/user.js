const express = require('express')
const router = express.Router();

const { registerUser, loginUser, logout, forgotPassword, resetPassword , getUserProfile, updatePassword, updateProfile, allUsers, getUserDetails, updateUser, deleteUser } = require('../controllers/usersController')

const { isAuthenticatedUser  } = require('../middlewares/auth')


router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logout);

router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me/update').put(updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, allUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, getUserDetails);
router.route('/admin/user/:id').put(isAuthenticatedUser, updateUser);
router.route('/admin/user/:id').delete(isAuthenticatedUser, deleteUser);

module.exports = router;