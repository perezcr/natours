const Tour = require('../models/Tour');
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

// Param-middleware: Middleware only just for certain parameters in URL. i.e.
// router.param('id', checkId);

// Using json method set automatically content-type to application/json
exports.getAllTours = async (req, res, next) => {
  const tours = await Tour.find();

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

exports.deleteTour = (req, res, next) => {
  // 204 = No Content
  res.status(204).json({
    result: 'success',
    data: null,
  });
};
