const express = require('express');

const {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('../routes/reviewsRoutes');

const router = express.Router();

// Redirect review routes to reviewRouter
router.use('/:tourId/reviews', reviewRouter);

router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5').get(aliasTopTours, getAllTours);

router.route('/')
.get(protect, getAllTours)
.post(createTour);

router.route('/:id')
.get(getTour)
.patch(updateTour)
.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
