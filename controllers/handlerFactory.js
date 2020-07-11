const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;

    const resourceName = Model.collection.name.slice(0, -1);
    if (!document) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [resourceName]: document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(req.body.filter), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();

    // explain(): Which makes this query return detailed execution stats instead of the actual query result. This method is useful for determining what index your queries use.
    // "executionStats" props
    // "nReturned": Number of documents that were returned were three
    // "totalDocsExamined": Number of documents that were examined is nine (all documents)
    // const documents = await features.query.explain();
    const documents = await features.query;

    const resourceName = Model.collection.name;
    // Using json method set automatically content-type to application/json
    res.status(200).json({
      status: 'success',
      requestAt: req.requestTime,
      results: documents.length,
      data: { [resourceName]: documents },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    const resourceName = Model.collection.name.slice(0, -1);
    res.status(201).json({
      status: 'success',
      data: {
        [resourceName]: document,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // new: true -> return the new document
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const resourceName = Model.collection.name.slice(0, -1);
    if (!document) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      result: 'success',
      data: {
        [resourceName]: document,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    const resourceName = Model.collection.name.slice(0, -1);
    if (!document) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }
    // 204 = No Content
    res.status(204).json({
      result: 'success',
      data: null,
    });
  });
