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
  if (summary) {
    if (summary.isMissing) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found in the system');
    }
    return summary;
  }

  // If not found, query BigQuery
  try {
    const result = await queryBigQueryForSummary(address);
    summary = await createWalletSummary(result); // Create summary in MongoDB
  } catch (err) {
    if (err.statusCode === httpStatus.NOT_FOUND) {
      // Log the missing wallet in MongoDB
      await createMissingWalletSummary(address);
    }
    throw err; // Re-throw the error for proper handling
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
 * Create a missing wallet entry in MongoDB
 * @param {string} address
 * @returns {Promise<void>}
 */
const createMissingWalletSummary = async (address) => {
  const missingWallet = {
    account: address,
    isMissing: true,
  };
  await WalletSummary.create(missingWallet);
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
      ROUND(net_sent, 2) AS total_sent_amount, -- Round to 2 decimal places
      ROUND(net_received, 2) AS total_received_amount, -- Round to 2 decimal places
      unique_wallet_transfers,
      FORMAT_DATE('%Y-%m-%d', most_active_day) AS most_active_day,
      highest_daily_transaction_count AS most_active_day_count,
      most_active_month,
      highest_monthly_transaction_count AS monthly_transaction_count,
      top_interaction_wallet,
      total_interaction_count,
      top_5_transactions_by_category,
      ROUND(total_selling_amount_in_xlm, 2) AS total_selling_amount, -- Round to 2 decimal places
      ROUND(total_buying_amount_in_xlm, 2) AS total_buying_amount, -- Round to 2 decimal places
      ROUND(net_pnl_in_xlm, 2) AS net_pnl, -- Round to 2 decimal places
      ROUND(token_balance, 2) AS token_balance, -- Round to 2 decimal places
      FORMAT_DATE('%Y-%m-%d', first_transaction_date) AS first_transaction_date,
      FORMAT_DATE('%Y-%m-%d', last_transaction_date) AS last_transaction_date,
      time_on_chain_days
    FROM
      \`blip-444620.stellar_wrapped.annual_account_summary_2024\`
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

    if (!rows || rows.length === 0) {
      console.warn(`BigQuery returned no rows for account: ${address}`);
      throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found in the system');
    }

    return rows[0];
  } catch (err) {
    if (err.message.includes('Query timed out')) {
      throw new ApiError(
        httpStatus.REQUEST_TIMEOUT,
        'The request timed out. Please try again later.'
      );
    }
    console.error('BigQuery Query Error:', err.message, {
      address,
      query,
      options,
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while processing your request.'
    );
  }
};

module.exports = {
  getAccountActivitySummary,
};
