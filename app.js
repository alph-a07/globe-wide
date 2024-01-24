const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES
app.use(express.json());
// Use logger only in development environment
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// MOUNT ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Stray routes handler
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'failed',
        message: `Can't find ${req.originalUrl}!`,
    });
});

module.exports = app;
