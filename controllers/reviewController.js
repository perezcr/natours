const Review = require('../models/Review');
const factory = require('./handlerFactory');

exports.setFilter = (req, res, next) => {
  if (req.params.tourId) req.body.filter = { tour: req.params.tourId };
  next();
};

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
