const express = require('express');
const { getAllReviews, createReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({
  // By default, each router only have access to the parameters of their specific routes.
  // In order to get access to tourId parameters in this other router, we need merge the parameters
  mergeParams: true,
});

router.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);

module.exports = router;
