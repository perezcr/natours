class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Build Query
    // 1A. Filtering
    const query = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete query[field]);

    // 1B. Advance filtering
    // gte, lte, gt, lt
    // e.g: gte => $gte
    let queryString = JSON.stringify(query);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sorting() {
    // 2. Sorting
    if (this.queryString.sort) {
      // Multiple Sort: ?sort=-price,ratingsAverage
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default Sorting
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3. Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // - means excluding
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4. Pagination
    // Default values
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    // skip:  Amount of results that should be skipped before actually querying data.
    // limit: Amount of results that we want in the query
    // ?page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
