const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// Safety net - handles all unhandled synchronous exceptions
process.on('uncaughtException', err => {
    console.log('🚫 UNHANDLED EXCEPTION - Shutting down...');
    console.log(err.name, ':', err.message);

    process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(_ => console.log('Connected to DB!'));

const port = process.env.port || 8080;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// Safety net - handles all unhandled promises
process.on('unhandledRejection', err => {
    console.log('🚫 UNHANDLED REJECTION - Shutting down...');
    console.log(err.name, err.message);

    // Close the app after server is closed!
    server.close(() => {
        process.exit(1);
    });
});
