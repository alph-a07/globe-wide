const express = require('express');
const router = express.Router();

const { signup, login, forgotPassword, resetPassword, protect, updatePassword } = require('../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMyData, deleteMyAccount } = require('./../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMyData', protect, updateMyData);
router.delete('/deleteMyAccount', protect, deleteMyAccount);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
