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
}

module.exports = APIFeatures;
