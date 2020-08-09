// API: Application Programming Interface: a piece of software that can be used
// by another piece of software, in order to allow applications to talk to each other.

// REST Architecture
// 1. Separate API into logical resources
// Resource: Object or representation of something, which has data associated to it.
// Any information that can be named can be a resource. tours, users, reviews
// 2. Expose structured, resource-based URLs
// 3. Use HTTP methods(verbs)
// GET, POST, PUT, PATCH, DELETE
// 4. Send data as JSON(usually)
// Usually is used JSend: { status: success, fail, error, data }
// 5. Be stateless
// Stateless RESTful API: All state is handled ON THE CLIENT. This means that each request must
// contain ALL the information necessary to process a certain request. The server should NOT have
// to remember previous request
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1. Global Middlewares
// Set security HTTP headers
// Is best to use this package early in the middleware stack
// Test: Open Postman -> do request -> look at amount of Headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 100 request from the same IP in one hour
// Test: Open Postman -> do request -> look at Headers (X-RateLimit-Limit, X-RateLimit-Remaining)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again in an hour!',
  },
});
app.use('/api', limiter);

// Reading data from body into req.body
// Function that modify the incoming request data (middle of the request and response)
// Not accept body larger than 10kb
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
// Clean all dollar signs $ on mongo queries
// { "email": { "$gt": "" }, "password": "password" }
app.use(mongoSanitize());

// Data sanitization against XSS
// Clean HTML code
app.use(xss());

// Prevent parameter polution
// Clear query string -> api/v1/tours?sort=duration&sort=price
// middleware only using the last one
// Whitelist: api/v1/tours?duration=3&duration=5 -> results between 3 and 5
app.use(
  hpp({
    whitelist: [
      'difficulty',
      'duration',
      'maxGroupSize',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// Serving static files
// The files that are sitting in our file system that we currently cannot access using routes
// In order to access to file system is necessary to use a built-in express middleware
app.use(express.static(`${__dirname}/public`));

// Create own middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// .all -> for all the verbs (get, post, patch, put, delete)
app.all('*', (req, res, next) => {
  /* res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  }); */
  // When next() receives an argument, express automatically knows that is an error
  // it will skip all the other middlewares in the middleare stack and sent the error to global error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// 3. Start Server
module.exports = app;
