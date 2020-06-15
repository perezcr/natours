const Tour = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');

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

// Using json method set automatically content-type to application/json
exports.getAllTours = async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.createTour = async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    result: 'success',
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = async (req, res, next) => {
  // new: true -> return the new document
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    result: 'success',
    data: {
      tour,
    },
  });
};

exports.deleteTour = async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);

  // 204 = No Content
  res.status(204).json({
    result: 'success',
    data: null,
  });
};

// Aggregation Pipeline
exports.getToursStats = async (req, res) => {
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
};
