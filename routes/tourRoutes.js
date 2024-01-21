const express = require('express');
const tourController = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour } = require('../controllers/tourController');

const router = express.Router();

router.route('/').get(getAllTours).post(tourController.checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
