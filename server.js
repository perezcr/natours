const dotenv = require('dotenv');
// It will read variables in file and save them into node.js environment variables
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} 🔥`);
});
