const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const factory = require('../controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) newObj[key] = obj[key];
    });

    return newObj;
};

exports.updateMyData = catchAsync(async (req, res, next) => {
    // 1. Create error if user updates password through this route
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for updating password, please use /updateMyPassword', 400));
    }

    // 2. Update the data in database
    const filteredBody = filterObj(req.body, 'name', 'email');

    const userUpdated = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: userUpdated,
        },
    });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead',
    });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Put the id in params in order to use the factory function
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// DO NOT change passwords with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
