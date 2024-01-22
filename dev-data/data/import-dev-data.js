const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(conn => console.log('Connected to DB!'));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data to database
const importData = async function () {
    try {
        await Tour.create(tours);
        console.log('Data successfully deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

// Delete all data from collection
const deleteData = async function () {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
