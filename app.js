const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorController = require('./controllers/errorController');

const app = express();

// Body data parser middleware
app.use(express.json({ limit: '10kb' }));

// Security HTTP headers middleware
app.use(helmet());

// Development logging middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// API Rate limiting middleware
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, please try again in an hour!',
});
app.use('/api', limiter);

// MOUNT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Throws error for all stray routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Handles any error in the middleware stack
app.use(globalErrorController);

module.exports = app;
