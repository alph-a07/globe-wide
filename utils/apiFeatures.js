class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        // 1. req.query => query parameters object
        const queryObj = { ...this.queryStr }; // deep copy

        // 2. Removing non-relavant query parameters
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // 3. Handling inequality queries
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default sort - latest first
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const limitTo = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(limitTo);
        } else {
            // Default limiting - avoid __v
            this.query = this.query.select('-__v');
        }

        return this;
    }

    pagination() {
        const page = +this.queryStr.page || 1;
        const limit = +this.queryStr.limit || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
