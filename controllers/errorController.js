const sendErrorDev = (err, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational errors - Inform client
    if (err.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
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

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') sendErrorDev(req, res);
    else if (process.env.NODE_ENV === 'development') sendErrorProd(req, res);
};
