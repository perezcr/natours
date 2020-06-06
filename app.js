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

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1. Middlewares

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Reading data from body into req.body
// Function that modify the incoming request data (middle of the request and response)
// Not accept body larger than 10kb
app.use(express.json({ limit: '10kb' }));

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

// 3. Start Server
module.exports = app;
