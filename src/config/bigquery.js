const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');
const logger = require('./logger');

// Decode the Base64 credentials
let credentials;
try {
  credentials = JSON.parse(Buffer.from(config.bigquery.credentials_base64, 'base64').toString('utf-8'));
  logger.info('Google Cloud service account configured');
} catch (error) {
  logger.error('Failed to decode service account credentials:', error.message);
  throw error;
}

// Initialize BigQuery
const bigquery = new BigQuery({
  projectId: credentials.project_id,
  credentials: credentials,
});

module.exports = bigquery;
