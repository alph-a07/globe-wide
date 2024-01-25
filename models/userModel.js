const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please prvide your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, 'Invalid email!'],
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        minLength: [8, 'Password must contain atleast 8 characters.'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            validator: function (el) {
                return this.password === el;
            },
            message: 'Both passwords do not match!',
        },
    },
});

// Password encryption middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
