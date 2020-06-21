const mongoose = require('mongoose');
const dotenv = require('dotenv');
// It will read variables in file and save them into node.js environment variables
dotenv.config({ path: './config.env' });

// Uncaught exceptions: All errors or bugs that occur in synchronous code but are not handled anywhere
// Ex: console.log(x) when x is not defined
// This handler should be at the very top of our code or at least before other code is executed.
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // eslint-disable-next-line no-console
  console.log('Uncaught Exception! 💥  Shutting down...');
  // Its important crash the app because after there was an uncaught exception, the entire node process
  // is in a called unclean state and for fix that is necessary terminate and restart the server
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connection successful!');
  });

// Environment variables are global variables that are used to define the environment in which node app is running
// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port} 🔥`);
});

// Whatever promise rejection that we might not catch somewhere in the app is handled here
// We're listening the unhandledevent which then allow us to handle all the errors that occour in async code which were not previously handled
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // eslint-disable-next-line no-console
  console.log('Unhandled rejection! 💥  Shutting down...');
  // Give the server, time to finish all the request pending or being handled at time
  server.close(() => {
    // Shut down app
    // argument: 0 -> success, 1 -> uncaught exception
    process.exit(1);
  });
});
