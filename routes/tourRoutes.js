const express = require('express');
const {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  getToursStats,
  getMonthlyPlan,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Aliasing
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getToursStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
