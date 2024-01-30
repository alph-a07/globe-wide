const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

// Connect to database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(_ => console.log('Connected to DB!'));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data to database
const importData = async function () {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully imported');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data from collection
const deleteData = async function () {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Run the appropriate functions based on command line arguments
if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();

// console.log(process.argv);
// [
//     '/usr/bin/node',
//     '/home/itsjeel01/Developer/globewide/dev-data/data/import-dev-data.js',
//     '--import'
//   ]
