const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Please provide your valuable feedback!'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name',
    // });

    this.populate({
        path: 'user',
        select: 'name photo',
    });

    next();
});

reviewSchema.statics.calcAvgRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length !== 0) {
        // prettier-ignore
        await Tour.findByIdAndUpdate(tourId, { 
            ratingsAverage: stats[0].avgRating, 
            ratingsQuantity: stats[0].nRating, 
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0,
        });
    }
};

reviewSchema.post('save', function () {
    // this keyword refers the Review document
    this.constructor.calcAvgRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    // this keyword refers to the query
    // Mongoose no longer allows executing the same query instance twice -- use clone()
    this.review = await this.clone().findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    // this keyword refers to the query -- already executed at this stage
    this.review.constructor.calcAvgRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
