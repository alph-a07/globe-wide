const express = require('express');
const router = express.Router();

const { 
    signup, 
    login, 
    forgotPassword, 
    resetPassword, 
    protect, 
    updatePassword, 
    restrictTo 
} = require('../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMyData, deleteMyAccount, getMe } = require('./../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// --- Protect all routes after this point ---
router.use(protect);

router.get('/me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMyData', updateMyData);
router.delete('/deleteMyAccount', deleteMyAccount);

// --- Admins only actions ahead ---
router.use(restrictTo('admin'));

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;
