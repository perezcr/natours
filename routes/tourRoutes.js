const express = require('express');
const reviewRouter = require('./reviewRoutes');
const {
  aliasTopTours,
  getToursStats,
  getMonthlyPlan,
  getToursWithin,
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// Aliasing
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getToursStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

// :unit is km or mi for distance
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/distance/233/center/-40,45/unit/mi -> cleaner
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
