const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Review = require('../models/Review');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connection succesful!');
  });

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into db
const importData = async () => {
  try {
    const toursPromise = Tour.create(tours);
    const usersPromise = User.create(users, { validateBeforeSave: false });
    const reviewsPromise = Review.create(reviews);
    await Promise.all([toursPromise, usersPromise, reviewsPromise]);
    // eslint-disable-next-line no-console
    console.log('Data succesfully loaded!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    // eslint-disable-next-line no-console
    console.log('Data succesfully deleted!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
