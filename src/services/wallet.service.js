/**
 * src/services/walletSummary.service.js
 */
const httpStatus = require('http-status');
const { WalletSummary } = require('../models');
const ApiError = require('../utils/ApiError');
const bigquery = require('../config/bigquery');

/**
 * Get the user's wallet summary (transactions, P&L, etc.) from MongoDB or fallback to BigQuery.
 * @param {string} address - The user’s Stellar account ID (G...)
 * @returns {Promise<object>} - A wallet summary object
 */
const getAccountActivitySummary = async (address) => {
  // 1) Try to find in MongoDB first
  let summary = await findWalletSummary(address);
  if (summary) {
    if (summary.isMissing) {
      // If we have a "missing" placeholder, throw 404
      throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found in the system');
    }
    return summary; // Found in DB, return it
  }

  // 2) If not in MongoDB, query BigQuery
  try {
    const result = await queryBigQueryForSummary(address);
    summary = await createWalletSummary(result); // Create doc in Mongo
  } catch (err) {
    if (err.statusCode === httpStatus.NOT_FOUND) {
      // 2a) If BQ says no wallet found, store a missing placeholder
      await createMissingWalletSummary(address);
    }
    throw err; // Re-throw for higher-level handling
  }

  return summary;
};

/**
 * Query BigQuery for wallet summary
 * We'll cast `most_active_month` to a string "YYYY-MM" using FORMAT_DATE('%Y-%m', ...).
 * @param {string} address
 * @returns {Promise<object>}
 */
const queryBigQueryForSummary = async (address) => {
  const query = `
    -- Optionally, if you had a DECLARE address, you could do that, but
    -- typically we pass it via a parameter. We'll skip "DECLARE" logic in modern usage.
    -- We'll wrap the logic in a CTE (user_row) so we can manipulate columns easily.

    WITH user_row AS (
      SELECT
        account,
        total_transactions,

        -- Round top-level numeric columns to 2 decimals
        ROUND(total_sent_xlm, 2)     AS total_sent_xlm,
        ROUND(total_received_xlm, 2) AS total_received_xlm,
        ROUND(total_selling_xlm, 2)  AS total_selling_xlm,
        ROUND(total_buying_xlm, 2)   AS total_buying_xlm,
        ROUND(net_pnl_xlm, 2)        AS net_pnl_xlm,

        time_on_chain_days,
        first_txn_time,
        last_txn_time,

        ----------------------------------------------------------------------------
        -- Convert "last transaction" columns into a single JSON string
        ----------------------------------------------------------------------------
        TO_JSON_STRING(
          STRUCT(
            last_transaction_id         AS id,
            last_transaction_type_int   AS op_type_int,
            last_transaction_type_str   AS op_type_str,
            last_transaction_timestamp  AS timestamp,
            last_transaction_asset_code AS asset_code,
            ROUND(last_transaction_amount, 2) AS amount
          )
        ) AS last_transaction_details,

        ----------------------------------------------------------------------------
        -- Last NON-XLM as JSON
        ----------------------------------------------------------------------------
        TO_JSON_STRING(
          STRUCT(
            last_nonxlm_transaction_id         AS id,
            last_nonxlm_transaction_type_int   AS op_type_int,
            last_nonxlm_transaction_type_str   AS op_type_str,
            last_nonxlm_transaction_timestamp  AS timestamp,
            last_nonxlm_transaction_asset_code AS asset_code,
            ROUND(last_nonxlm_transaction_amount, 2) AS amount
          )
        ) AS last_nonxlm_transaction_details,

        ----------------------------------------------------------------------------
        -- Last XLM as JSON
        ----------------------------------------------------------------------------
        TO_JSON_STRING(
          STRUCT(
            last_xlm_transaction_id         AS id,
            last_xlm_transaction_type_int   AS op_type_int,
            last_xlm_transaction_type_str   AS op_type_str,
            last_xlm_transaction_timestamp  AS timestamp,
            last_xlm_transaction_asset_code AS asset_code,
            ROUND(last_xlm_transaction_amount, 2) AS amount
          )
        ) AS last_xlm_transaction_details,

        ----------------------------------------------------------------------------
        -- top_1_largest_nonxlm -> we transform array => array with amounts rounded => JSON
        ----------------------------------------------------------------------------
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              row.nonxlm_asset_code,
              ROUND(row.nonxlm_amount, 2) AS nonxlm_amount,
              row.nonxlm_op_type_int,
              row.nonxlm_op_type_str,
              row.tx_id,
              row.tx_time
            FROM UNNEST(top_1_largest_nonxlm) AS row
          )
        ) AS top_largest_nonxlm,

        -- Similarly, for top_1_largest_xlm
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              x.xlm_asset_code,
              ROUND(x.xlm_amount, 2) AS xlm_amount,
              x.xlm_op_type_int,
              x.xlm_op_type_str,
              x.tx_id,
              x.tx_time
            FROM UNNEST(top_1_largest_xlm) AS x
          )
        ) AS top_largest_xlm,

        -- top_1_nonxlm_sent => code, total_sent (rounded)
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              s.code,
              ROUND(s.total_sent, 2) AS total_sent
            FROM UNNEST(top_1_nonxlm_sent) s
          )
        ) AS top_nonxlm_sent,

        -- top_1_nonxlm_received => code, total_received
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              r.code,
              ROUND(r.total_received, 2) AS total_received
            FROM UNNEST(top_1_nonxlm_received) r
          )
        ) AS top_nonxlm_received,

        -- top_1_nonxlm_selling => code, total_selling
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              sl.code,
              ROUND(sl.total_selling, 2) AS total_selling
            FROM UNNEST(top_1_nonxlm_selling) sl
          )
        ) AS top_nonxlm_selling,

        -- top_1_nonxlm_buying => code, total_buying
        TO_JSON_STRING(
          ARRAY(
            SELECT AS STRUCT
              b.code,
              ROUND(b.total_buying, 2) AS total_buying
            FROM UNNEST(top_1_nonxlm_buying) b
          )
        ) AS top_nonxlm_buying,

        ----------------------------------------------------------------------------
        -- Interactions, active day/month, categories
        ----------------------------------------------------------------------------
        unique_wallet_interactions,
        top_interaction_wallet,
        top_interaction_count,
        most_active_day,
        most_active_day_count,
        FORMAT_DATE('%Y-%m', most_active_month) AS most_active_month,
        most_active_month_count,
        top_5_transactions_by_category,

        ----------------------------------------------------------------------------
        -- Balances (rounded)
        ----------------------------------------------------------------------------
        ROUND(token_balance, 2) AS token_balance,
        ROUND(starting_balance, 2) AS starting_balance,
        ROUND(balance_diff, 2)   AS balance_diff

      FROM \`blip-444620.stellar_wrapped.enriched_user_2024_snapshot\`
      WHERE account = @account
      LIMIT 1
    )

    SELECT * FROM user_row;
  `;

  const options = {
    query,
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

    // Convert any BigQueryTimestamp / BigQueryDate objects to normal JS Date if needed
    fixBigQueryDates(rows[0]);

    return rows[0];
  } catch (err) {
    if (err.message.includes('Query timed out')) {
      throw new ApiError(
        httpStatus.REQUEST_TIMEOUT,
        'The request timed out. Please try again later.'
      );
    }
    console.error('BigQuery Query Error:', err.message, { address, query, options });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An error occurred while processing your request.'
    );
  }
};

/**
 * Convert BigQuery-specific date/time objects into standard JavaScript Date objects.
 * Helps avoid Mongoose cast errors when storing them in Date fields.
 */
function fixBigQueryDates(obj) {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (!val) continue;

      if (val.constructor?.name === 'BigQueryTimestamp' || val.constructor?.name === 'BigQueryDate') {
        obj[key] = new Date(val.value);
      } else if (Array.isArray(val)) {
        val.forEach((item) => fixBigQueryDates(item));
      } else if (typeof val === 'object') {
        fixBigQueryDates(val);
      }
    }
  }
}

/**
 * Insert a "missing" wallet doc if BigQuery had no results.
 */
const createMissingWalletSummary = async (address) => {
  const missingWallet = {
    account: address,
    isMissing: true,
  };
  await WalletSummary.create(missingWallet);
};

/**
 * Try to find an existing summary doc in MongoDB.
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
 * Create a new summary doc in MongoDB, collapsing multiple "last tx" fields into JSON.
 */
const createWalletSummary = async (summaryData) => {
  const summary = await WalletSummary.create({
    account: summaryData.account,
    isMissing: false,

    // Transaction stats
    total_transactions: summaryData.total_transactions || 0,
    total_sent_xlm: summaryData.total_sent_xlm || 0,
    total_received_xlm: summaryData.total_received_xlm || 0,
    total_selling_xlm: summaryData.total_selling_xlm || 0,
    total_buying_xlm: summaryData.total_buying_xlm || 0,
    net_pnl_xlm: summaryData.net_pnl_xlm || 0,

    // Times
    time_on_chain_days: summaryData.time_on_chain_days || 0,
    first_txn_time: summaryData.first_txn_time || null,
    last_txn_time: summaryData.last_txn_time || null,

    // Collapsed last transaction JSONs
    last_transaction_details: summaryData.last_transaction_details || '{}',
    last_nonxlm_transaction_details: summaryData.last_nonxlm_transaction_details || '{}',
    last_xlm_transaction_details: summaryData.last_xlm_transaction_details || '{}',

    // Arrays => already JSON from BQ => store them directly
    top_largest_nonxlm: summaryData.top_largest_nonxlm || '[]',
    top_largest_xlm: summaryData.top_largest_xlm || '[]',
    top_nonxlm_sent: summaryData.top_nonxlm_sent || '[]',
    top_nonxlm_received: summaryData.top_nonxlm_received || '[]',
    top_nonxlm_selling: summaryData.top_nonxlm_selling || '[]',
    top_nonxlm_buying: summaryData.top_nonxlm_buying || '[]',

    // Interactions
    unique_wallet_interactions: summaryData.unique_wallet_interactions || 0,
    top_interaction_wallet: summaryData.top_interaction_wallet || null,
    top_interaction_count: summaryData.top_interaction_count || 0,

    // Most active day/month
    most_active_day: summaryData.most_active_day || null,
    most_active_day_count: summaryData.most_active_day_count || 0,
    most_active_month: summaryData.most_active_month || '',
    most_active_month_count: summaryData.most_active_month_count || 0,
    top_5_transactions_by_category: summaryData.top_5_transactions_by_category || '',

    // Balances
    token_balance: summaryData.token_balance || 0,
    starting_balance: summaryData.starting_balance || 0,
    balance_diff: summaryData.balance_diff || 0,
  });

  const plainSummary = summary.toObject();
  delete plainSummary._id;
  delete plainSummary.__v;
  return plainSummary;
};

module.exports = {
  getAccountActivitySummary,
};
