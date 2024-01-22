const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

// Connect to database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(_ => console.log('Connected to DB!'));

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import data to database
const importData = async function () {
    try {
        await Tour.create(tours);
        console.log('Data successfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

// Delete all data from collection
const deleteData = async function () {
    try {
        await Tour.deleteMany();
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
