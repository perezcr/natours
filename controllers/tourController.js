const Tour = require('../models/Tour');
/* const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
); */

// Param-middleware: Middleware only just for certain parameters in URL. i.e.
// router.param('id', checkId);

// Using json method set automatically content-type to application/json
exports.getAllTours = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    requestAt: req.requestTime,
  });
};

exports.getTour = (req, res, next) => {
  res.status(200).json({
    status: 'success',
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

exports.updateTour = (req, res, next) => {
  res.status(200).json({
    result: 'success',
  });
};

exports.deleteTour = (req, res, next) => {
  // 204 = No Content
  res.status(204).json({
    result: 'success',
    data: null,
  });
};
