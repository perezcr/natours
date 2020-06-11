const Tour = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');

// Param-middleware: Middleware only just for certain parameters in URL. i.e.
// router.param('id', checkId);

// Using json method set automatically content-type to application/json
exports.getAllTours = async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFields();

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
