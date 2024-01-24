const AppError = require('../utils/appError');

const handleCastError = err => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new AppError(message, 400);
};

const handleDuplicateEntry = err => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Field already exists: ${value}`;

    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational errors - Inform client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Unknown errors - Abstract from client
    else {
        console.log('ERROR 💥', err); // For developers

        // Client abstraction
        res.status(500).json({
            status: 'error',
            message: 'Unexpected error occured!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'err';

    if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (err.name === 'CastError') error = handleCastError(err);
        if (err.code === 11000) error = handleDuplicateEntry(err);

        sendErrorProd(error, res);
    }
};
