const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const bigquery = require('../config/bigquery');

/**
 * Get total number of transactions for a wallet
 * @param {string} address
 * @returns {Promise<object>}
 */
const getAccountActivitySummary = async (address) => {
  const query = `
    SELECT
      account,
      total_transactions,
      most_active_day,
      most_active_day_count
    FROM
      \`blip-444620.stellar_wrapped.account_activity_summary\`
    WHERE
      account = @account
  `;

  const options = {
    query: query,
    location: 'US',
    params: { account: address },
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();

  if (rows.length === 0) {
    throw new Error('No data found for the given account');
  }

  const result = rows[0];
  result.most_active_day = result.most_active_day.value; // Ensure most_active_day is a string

  return result;
};

module.exports = {
  getAccountActivitySummary,
};
