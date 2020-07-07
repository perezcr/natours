const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Param-middleware: Middleware only just for certain parameters in URL. i.e.
// router.param('id', checkId);

// Aliasing: Provide an alias route to a request that might be very popular, so it might be requested all the time.
// e.g: Provide a route specifically for the five best cheap tours.
exports.aliasTopTours = async (req, res, next) => {
  // ?limit=5&sort=-ratingAverage,price
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Aggregation Pipeline
exports.getToursStats = catchAsync(async (req, res, next) => {
  // Input: Array of Stages
  const stats = await Tour.aggregate([
    // Stage 1 (Match Stage)
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    // Stage 2: Group Stage
    {
      $group: {
        //_id: null, // Group by any property (all documents)
        _id: { $toUpper: '$difficulty' }, // $toUpper -> transform each difficulty prop to uppercase
        numTours: { $sum: 1 }, // Add 1 for each document
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // Stage 3: Sort Stage
    {
      // 1 means ascending, -1 descending
      $sort: { avgPrice: 1 },
    },
    // Stage 4: repeat $match stage
    /* {
      // $ne : not equal -> excluding easy key previously grouped
      $match: { _id: { $ne: 'EASY' } }
    } */
  ]);

  res.status(200).json({
    result: 'success',
    data: {
      stats,
    },
  });
});

// Calculate the busiest month of a given year
// Basically is calculate how many tours start in each month in a given year based in starDates property
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      // Unwind deconstruct an array field from the info documents and then output one document for each element of the array.
      // In this case create one tour for each element of startDates array
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // $month: Returns the month of a date as a number between 1 and 12.
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, // $push: Appends a specified value to an array. Create an array with name of tours.
      },
    },
    {
      $addFields: { month: '$_id' }, // $addFields: Appends new fields to existing documents.
    },
    {
      // $project: Passes along the documents with the requested fields to the next stage in the pipeline.
      // 0 not shows up or 1 shows up
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    result: 'success',
    data: {
      plan,
    },
  });
});

// We only want to populate it here in the 'Get One Tour,' and not in the 'Get All Tours' because that would be a bit too much information to send down to a client when they get all the tours.
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
