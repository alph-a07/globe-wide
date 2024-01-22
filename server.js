const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
    })
    .then(_ => console.log('Connected to DB!'));

const port = process.env.port || 8080;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
