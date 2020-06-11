const mongoose = require('mongoose');
const dotenv = require('dotenv');
// It will read variables in file and save them into node.js environment variables
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// Environment variables are global variables that are used to define the environment in which node app is running
// console.log(process.env);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} 🔥`);
});
