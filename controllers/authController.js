const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const sendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined; // Hide password from response

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    // Generating JWT
    sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Validate email and password inputs
    if (!email || !password) {
        return next(new AppError('Both email and password are required!', 400));
    }

    // 2. Check if user exists & provided password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('This combination of email and password does not exist', 401));
    }

    // 3. If all OK, send token
    sendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get user from email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('User with specified email does not exist!'), 404);
    }

    // 2. Generate a random reset token
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false }); // To save the token only to database

    // 3. Send reset email to user
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}. \nIf you did not forget your password, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset password token(Valid for 10 min)',
            message,
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error processing your request, please try again later.'));
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email address!',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1. Get user from the reset token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // prettier-ignore
    const user = await User.findOne({ 
        passwordResetToken: hashedToken, 
        passwordResetExpires: { $gt: Date.now() },
    });

    console.log(user);

    // 2. If the user and token are valid, set the new password
    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3. Update changedPasswordAt property -- Handled by middlware

    // 4. Send login JWT
    sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1. Get user
    const user = await User.findById(req.user.id).select('+password');

    // 2. Check if the old password is correct
    if (!user.checkPassword(req.body.passwordCurrent, user.password)) {
        return next(new AppError('Provided old password is wrong.', 401));
    }

    // 3. Update new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4. Send login JWT
    sendToken(user, 200, res);
});
