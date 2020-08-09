const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Radius is distance converted to radians
  // Divide distance by the radius of the earth.
  // Radius of earth depends unit (mi -> 3963.2), (km -> 6378.1)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and logitude in the format lat,lng', 400));
  }
  // geoWithin basically it finds documents within a certain geometry.
  // If you specify the distance of 250 km, then that means you want to find all the tour documents within a sphere that has a radius of 250 miles.
  // Mongodb expects the radius of our sphere in radians
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // 1mt = 0.000621371mi
  // 1mt = 0.001km
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and logitude in the format lat,lng', 400));
  }

  // $geoNear always needs to be the first one in the pipeline.
  // Note: $geoNear requires that at least one of our fields contains a geospatial index.
  // If there's only one field with a geospatial index then this $geoNear stage here will automatically use that index in order to perform the calculation.
  // But if you have multiple fields with geospatial indexes then you need to use the keys parameter in order to define the field that you want to use for calculations.
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        // near is the point from which to calculate the distances.
        // So all the distances will be calculated from this point that we define here, and then all the startLocations.
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        // Field that will be created and where all the calculated distances will be stored
        distanceField: 'distance',
        // By default the distance is given in meters so we need to convert to km or mi
        distanceMultiplier: multiplier,
      },
    },
    {
      // $project: Passes along the documents with the requested fields to the next stage in the pipeline.
      // 0 not shows up or 1 shows up
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { tours: distances },
  });
});

// We only want to populate it here in the 'Get One Tour,' and not in the 'Get All Tours' because that would be a bit too much information to send down to a client when they get all the tours.
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
