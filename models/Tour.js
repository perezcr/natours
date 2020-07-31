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
      // This setter function run each time that there is a new value
      set: (ratingAvg) => Math.round(ratingAvg * 10) / 10, // 4.6666 -> 46.666 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
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
    startLocation: {
      // MongoDB uses a special data format called GeoJSON, to specify geospatial data
      // We can specify a couple of properties in order for this object to be recognized as geospatial JSON
      // type and coordinates props
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, // Day in which the people will go to this location
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  // By default, Mongoose does not include virtuals when you convert a document to JSON.
  // Set the toJSON schema option to { virtuals: true }.
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create an index for the price field because i believe that it is one of the most important that people will query for.
// If we sometimes query for that field but combined with another one, then it's actually more efficient to create a compound index.
// 1: means that we're sorting the price index in an ascending order.
// -1: means that we're sorting the price index in an descending order.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
// For geospatial data, this index needs to be a 2D sphere index if the data describes real points on the Earth like sphere.
// startLocation here should be indexed to a 2D sphere.
tourSchema.index({ 'startLocation.coordinates': '2dsphere' });

// Virtual properties: Fields that will not be persistent, will not be saved into db
// We cannot use virtual properties in queries
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// We do not want to store that array of review ID's that could then grow indefinitely in our database
// Solution: Virtual Populate: Way of keeping that array of review ID's on a tour, but without actually persisting it to the database.
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Mongoose Middlewares
// Four types of middlewares in mongoose: document, query, agregate and model middleware
// pre or post hooks: define functions to run before o after a certain event
// 1. Document middleware: runs before save() and create() (NOT in insertMany())
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}); */

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

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
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
  const filterSecretTours = { $match: { secretTour: { $ne: true } } };

  const [firstStageInPipeline] = this.pipeline();
  // If the first stage is $geoNear must avoid agreggate other stage in beginning of the pipeline
  // eslint-disable-next-line no-prototype-builtins
  if (firstStageInPipeline.hasOwnProperty('$geoNear')) {
    // Add filterStage after that $geoNear stage
    this.pipeline().splice(1, 0, filterSecretTours);

    return next();
  }
  // Aggregate other stage for filtering secretTours in beginning of stage's array
  this.pipeline().unshift(filterSecretTours);

  // eslint-disable-next-line no-console
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
