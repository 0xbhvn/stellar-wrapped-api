const httpStatus = require('http-status');
const { User, WalletSummary } = require('../models');
const ApiError = require('../utils/ApiError');
const bigquery = require('../config/bigquery');

/**
 * Get total number of transactions for a wallet
 * @param {string} address
 * @returns {Promise<object>}
 */
const getAccountActivitySummary = async (address) => {
  // Check if the summary exists in MongoDB
  let summary = await findWalletSummary(address);
  if (!summary) {
    // If not found, query BigQuery and create the summary in MongoDB
    const result = await queryBigQueryForSummary(address);
    summary = await createWalletSummary(result);
  }
  return summary;
};

/**
 * Find wallet summary in MongoDB
 * @param {string} address
 * @returns {Promise<object>}
 */
const findWalletSummary = async (address) => {
  const summary = await WalletSummary.findOne({ account: address }).lean();
  if (summary) {
    delete summary._id;
    delete summary.__v;
  }
  return summary;
};

/**
 * Create wallet summary in MongoDB
 * @param {object} summaryData
 * @returns {Promise<object>}
 */
const createWalletSummary = async (summaryData) => {
  const summary = await WalletSummary.create(summaryData);
  const plainSummary = summary.toObject();
  delete plainSummary._id;
  delete plainSummary.__v;
  return plainSummary;
};

/**
 * Query BigQuery for wallet summary
 * @param {string} address
 * @returns {Promise<object>}
 */
const queryBigQueryForSummary = async (address) => {
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

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    if (rows.length === 0) {
      console.error('BigQuery returned no rows for account:', address);
      throw new Error('No data found for the given account');
    }

    const result = rows[0];
    result.most_active_day = result.most_active_day.value; // Ensure most_active_day is a string

    return result;
  } catch (err) {
    console.error('BigQuery Query Error:', err.message, {
      address,
      query,
      options,
    });
    throw new Error('Query timed out or failed to execute');
  }
};

module.exports = {
  getAccountActivitySummary,
};
