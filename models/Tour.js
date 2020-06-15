const mongoose = require('mongoose');
const slugify = require('slugify');

// Fat models, thin Controllers
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour mush have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour mush have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // By default, Mongoose does not include virtuals when you convert a document to JSON.
  // Set the toJSON schema option to { virtuals: true }.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual properties: Fields that will not be persistent, will not be saved into db
// We cannot use virtual properties in queries
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Mongoose Middlewares
// Four types of middlewares in mongoose: document, query, agregate and model middleware
// pre or post hooks: define functions to run before o after a certain event
// 1. Document middleware: runs before save() and create() (NOT in insertMany())
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* tourSchema.post('save', function(doc, next) {
  // doc is the previous document saved into database
  console.log(doc);
  next();
}); */

// 2. Query middleware: allow run functions before or after that a query is executed
// Create a regular expression for all string that start with find.
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // eslint-disable-next-line no-console
  console.log(`Query took ${Date.now() - this.start} milliseconds `);
  next();
});

// 3. Aggregation middleware
// Hide the secret tours on aggregation pipelines
tourSchema.pre('aggregate', function (next) {
  // Aggregate other stage for filtering secretTours in beginning of stage's array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  // eslint-disable-next-line no-console
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
