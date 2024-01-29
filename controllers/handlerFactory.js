const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) return next(new AppError('No document found', 404));

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedDoc) return next(new AppError('No document found', 404));

        res.status(200).json({
            status: 'success',
            data: {
                doc: updatedDoc,
            },
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) query.populate(populateOptions);

        const doc = await query;

        if (!doc) return next(new AppError('No document found', 404));

        res.status(200).json({
            status: 'success',
            doc,
        });
    });

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        // Only for nested GET reviews
        let filter;
        if (req.params.tourId) filter = { tour: req.params.tourId };

        // prettier-ignore
        const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

        const docs = await features.query;

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs,
            },
        });
    });
