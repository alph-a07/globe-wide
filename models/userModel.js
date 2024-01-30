const crypto = require('crypto');
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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        minLength: [8, 'Password must contain atleast 8 characters.'],
        select: false,
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// Password encryption middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // 12 - SALT(random string) length for extra security
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    console.log(this.password);

    next();
});

// Password changed notifying middleware
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    // The document saving is slower than JWT generation
    // Make adjustment of 1 sec to compensate
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Hide inactive accounts middleware
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.checkPassword = async function (providedPassword, correctPassword) {
    return await bcrypt.compare(providedPassword, correctPassword);
};

userSchema.methods.wasPasswordChanged = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return changedTimestamp > JWTTimestamp;
    }

    return false;
};

userSchema.methods.generateResetToken = function () {
    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Encrypt the token and store it to database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 3. Set token expiry time
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
