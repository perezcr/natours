const mongoose = require('mongoose');
const Tour = require('./Tour');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Problem: Each user should only review each tour once. Duplicate review happens when there is a review with the same user and the same tour ID.
// Each combination of tour and user has always to be unique.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Query middleware: allow run functions before or after that a query is executed
reviewSchema.pre(/^find/, function (next) {
  // Not populate tour ref because Tour itself already populate reviews
  /* this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  }); */
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Calculate the average rating and number of ratings of a tour each time that a new review is added to that tour or also when a review is updated or deleted
// Static method is a class method
reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const statsQuery = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const [stats] = statsQuery;
  // If there are not reviews so assign default value
  const propsToUpdate = {
    ratingsQuantity: stats ? stats.nRating : 0,
    ratingsAverage: stats ? stats.avgRating : 4.5,
  };

  await Tour.findByIdAndUpdate(tourId, propsToUpdate);
};

// Execute static method when a review is created
// Execute static method when a review is updated or deleted
// findByIdAndUpdate, findByIdAndDelete: behind the scenes is only just a shorthand for findOneAndUpdate, findOneAndDelete with the current ID
reviewSchema.post(/save|^findOne/, async function (doc, next) {
  // Review.calculateAverageRatings()
  // This points to the current model (doc.constructor)
  await doc.constructor.calculateAverageRatings(doc.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
