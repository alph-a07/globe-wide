const express = require('express');

const { getAllReviews, createReview, deleteReview, upadteReview, setTourAndUser, getReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// Accepts parameters from other routes 
const router = express.Router({ mergeParams: true });

router.route('/')
.get(getAllReviews)
.post(protect, restrictTo('user'), setTourAndUser, createReview);

router.route('/:id')
.get(getReview)
.delete(deleteReview)
.patch(upadteReview);

module.exports = router;
