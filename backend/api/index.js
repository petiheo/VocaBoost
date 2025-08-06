require('dotenv').config();
const app = require('../src/app');

// Export the app as a serverless function
module.exports = app;