const express = require('express');
const {
  getMe,
  getUser,
  getAllUsers,
  createUser,
  updateMe,
  updateUser,
  deleteMe,
  deleteUser,
} = require('../controllers/userController');
const {
  protect,
  restrictTo,
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes that come after this middleware.
router.use(protect);

router.patch('/updatePassword', updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// Restric to admin all routes that come after this middleware.
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
