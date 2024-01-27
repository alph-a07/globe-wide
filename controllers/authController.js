const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    // Generating JWT
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email and password inputs
    if (!email || !password) {
        return next(new AppError('Both email and password are required!', 400));
    }

    // Check if user exists & provided password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('This combination of email and password does not exist', 401));
    }

    // If all OK, send token
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1. Check if token exists
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('You are not logged in! Please login to access.', 401));

    // 2. Validate the token
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check if user associated still exists
    const user = await User.findById(payload.id);
    if (!user) return next(new AppError('User does not exist!', 401));

    // 4. Check if the password was changed after token generation
    if (await user.wasPasswordChanged(payload.iat)) {
        return next(new AppError('The account password was changed, try logging in again with the new password.', 401));
    }

    console.log('protect');

    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not authorised to perform this operation', 403));
        }

        next();
    };
};
