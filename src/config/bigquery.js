// Import the library
const { BigQuery } = require('@google-cloud/bigquery');
const config = require('../config/config');

// Create a client instance
const bigquery = new BigQuery(
  {
    projectId: config.bigquery.projectId
  }
);


module.exports = bigquery;
