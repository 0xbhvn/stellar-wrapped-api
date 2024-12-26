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
    // If BQ says no wallet found, store a missing placeholder
    if (err.statusCode === httpStatus.NOT_FOUND) {
      await createMissingWalletSummary(address);
    }
    throw err; // Re-throw for higher-level handling
  }

  return summary;
};

/**
 * Query BigQuery for a single JSON row from the new partitioned JSON table.
 * Then map that JSON to the structure we need for Mongo.
 * @param {string} address - The user’s Stellar account ID
 * @returns {Promise<object>}
 */
const queryBigQueryForSummary = async (address) => {

  // 2) Query the partitioned table
  const query = `
    WITH user_row AS (
      SELECT
        row_data
      FROM \`blip-444620.stellar_wrapped.enriched_user_2024_snapshot_json_partitioned\`
      WHERE
        -- Let BigQuery compute the same expression it used for partitioning
        ABS(MOD(FARM_FINGERPRINT(@account), 10)) = hashed_account
        AND account = @account
      LIMIT 1
    )
    SELECT row_data FROM user_row;
  `;

  const options = {
    query,
    location: 'US',
    params: {
      account: address,
    },
  };

  try {
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    if (!rows || rows.length === 0) {
      console.warn(`BigQuery returned no rows for account: ${address}`);
      throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found in the system');
    }

    // row_data is a JSON string with all fields except "account"
    const rowDataStr = rows[0].row_data;
    const rawObj = JSON.parse(rowDataStr);

    // Optionally convert any date/time strings to JS Dates
    fixBigQueryDates(rawObj);

    // Map the JSON payload to your existing schema structure
    const mappedObj = mapJsonPayloadToSummary(address, rawObj);

    return mappedObj;
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
 * Map the JSON payload to the structure we need for Mongo.
 * @param {string} address - The user’s Stellar account ID
 * @param {object} rawObj - The raw JSON payload from BigQuery
 * @returns {object} - The mapped summary object
 */
function mapJsonPayloadToSummary(address, rawObj) {
  // 1) Fix date strings in place so they're Date objects
  fixBigQueryDates(rawObj);

  // 2) Build your "last transaction" objects
  //    Then store them as JSON strings in the final doc.
  const lastTx = {
    id: rawObj.last_transaction_id || null,
    op_type_int: rawObj.last_transaction_type_int || null,
    op_type_str: rawObj.last_transaction_type_str || null,
    timestamp: rawObj.last_transaction_timestamp || null,
    asset_code: rawObj.last_transaction_asset_code || null,
    amount: rawObj.last_transaction_amount || null,
  };
  const lastNonXlmTx = {
    id: rawObj.last_nonxlm_transaction_id || null,
    op_type_int: rawObj.last_nonxlm_transaction_type_int || null,
    op_type_str: rawObj.last_nonxlm_transaction_type_str || null,
    timestamp: rawObj.last_nonxlm_transaction_timestamp || null,
    asset_code: rawObj.last_nonxlm_transaction_asset_code || null,
    amount: rawObj.last_nonxlm_transaction_amount || null,
  };
  const lastXlmTx = {
    id: rawObj.last_xlm_transaction_id || null,
    op_type_int: rawObj.last_xlm_transaction_type_int || null,
    op_type_str: rawObj.last_xlm_transaction_type_str || null,
    timestamp: rawObj.last_xlm_transaction_timestamp || null,
    asset_code: rawObj.last_xlm_transaction_asset_code || null,
    amount: rawObj.last_xlm_transaction_amount || null,
  };

  // 3) Convert your "top_1_*" arrays to JSON strings
  //    We'll do the raw copy here, then we'll do rounding in a helper.
  const topLargestNonxlmJson = JSON.stringify(rawObj.top_1_largest_nonxlm || []);
  const topLargestXlmJson = JSON.stringify(rawObj.top_1_largest_xlm || []);
  const topNonxlmSentJson = JSON.stringify(rawObj.top_1_nonxlm_sent || []);
  const topNonxlmReceivedJson = JSON.stringify(rawObj.top_1_nonxlm_received || []);
  const topNonxlmSellingJson = JSON.stringify(rawObj.top_1_nonxlm_selling || []);
  const topNonxlmBuyingJson = JSON.stringify(rawObj.top_1_nonxlm_buying || []);

  // 4) Reformat most_active_month if you want "YYYY-MM"
  reformatMostActiveMonth(rawObj);

  // 5) Build the final object (unrounded)
  const doc = {
    account: address,
    isMissing: false,

    // Transaction stats (unrounded yet)
    total_transactions: rawObj.total_transactions || 0,
    total_sent_xlm: rawObj.total_sent_xlm || 0,
    total_received_xlm: rawObj.total_received_xlm || 0,
    total_selling_xlm: rawObj.total_selling_xlm || 0,
    total_buying_xlm: rawObj.total_buying_xlm || 0,
    net_pnl_xlm: rawObj.net_pnl_xlm || 0,

    // Times
    time_on_chain_days: rawObj.time_on_chain_days || 0,
    first_txn_time: rawObj.first_txn_time || null,
    last_txn_time: rawObj.last_txn_time || null,

    // Collapsed last tx JSON
    last_transaction_details: JSON.stringify(lastTx),
    last_nonxlm_transaction_details: JSON.stringify(lastNonXlmTx),
    last_xlm_transaction_details: JSON.stringify(lastXlmTx),

    // Arrays => store them as JSON strings
    top_largest_nonxlm: topLargestNonxlmJson,
    top_largest_xlm: topLargestXlmJson,
    top_nonxlm_sent: topNonxlmSentJson,
    top_nonxlm_received: topNonxlmReceivedJson,
    top_nonxlm_selling: topNonxlmSellingJson,
    top_nonxlm_buying: topNonxlmBuyingJson,

    // Interactions
    unique_wallet_interactions: rawObj.unique_wallet_interactions || 0,
    top_interaction_wallet: rawObj.top_interaction_wallet || null,
    top_interaction_count: rawObj.top_interaction_count || 0,

    // Most active day/month
    most_active_day: rawObj.most_active_day || null,
    most_active_day_count: rawObj.most_active_day_count || 0,
    most_active_month: rawObj.most_active_month || '',
    most_active_month_count: rawObj.most_active_month_count || 0,
    top_5_transactions_by_category: rawObj.top_5_transactions_by_category || '',

    // Balances
    token_balance: rawObj.token_balance || 0,
    starting_balance: rawObj.starting_balance || 0,
    balance_diff: rawObj.balance_diff || 0,
  };

  // 6) ROUND everything as needed
  applyRounding(doc);

  return doc;
}

/**
 * Rounds numeric fields in place,
 * and also re-parses JSON strings to round nested amounts.
 * @param {object} doc - The summary object to round
 * @returns {object} - The rounded summary object
 */
function applyRounding(doc) {
  // Example: Round these to 2 decimals
  doc.total_sent_xlm = round(doc.total_sent_xlm, 2);
  doc.total_received_xlm = round(doc.total_received_xlm, 2);
  doc.total_selling_xlm = round(doc.total_selling_xlm, 2);
  doc.total_buying_xlm = round(doc.total_buying_xlm, 2);
  doc.net_pnl_xlm = round(doc.net_pnl_xlm, 2);

  // Maybe you only want 2 decimals for these as well.
  // If you want "0 decimals," do round(..., 0)
  doc.token_balance = round(doc.token_balance, 2);
  doc.starting_balance = round(doc.starting_balance, 2);
  doc.balance_diff = round(doc.balance_diff, 2);

  // Round amounts inside last_transaction_details, etc. (2 decimals)
  doc.last_transaction_details = roundTxnDetails(doc.last_transaction_details, 2);
  doc.last_nonxlm_transaction_details = roundTxnDetails(doc.last_nonxlm_transaction_details, 2);
  doc.last_xlm_transaction_details = roundTxnDetails(doc.last_xlm_transaction_details, 2);

  // For array fields, parse => round => re-stringify
  doc.top_largest_nonxlm = roundArrayAmounts(doc.top_largest_nonxlm, 'nonxlm_amount', 0);
  doc.top_largest_xlm = roundArrayAmounts(doc.top_largest_xlm, 'xlm_amount', 0);

  doc.top_nonxlm_sent = roundArrayAmounts(doc.top_nonxlm_sent, 'total_sent', 0);
  doc.top_nonxlm_received = roundArrayAmounts(doc.top_nonxlm_received, 'total_received', 0);
  doc.top_nonxlm_selling = roundArrayAmounts(doc.top_nonxlm_selling, 'total_selling', 0);
  doc.top_nonxlm_buying = roundArrayAmounts(doc.top_nonxlm_buying, 'total_buying', 0);
}

/**
 * Helper to parse a JSON string of transaction details and round the "amount" field.
 * @param {string} jsonStr - The JSON string of transaction details
 * @param {number} decimals - The number of decimal places to round to
 * @returns {string} - The rounded JSON string
 */
function roundTxnDetails(jsonStr, decimals = 2) {
  if (!jsonStr) return jsonStr;
  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj.amount === 'number') {
      obj.amount = round(obj.amount, decimals);
    }
    return JSON.stringify(obj);
  } catch (err) {
    return jsonStr; // fallback if parse fails
  }
}

/**
 * Helper to parse a JSON array (e.g. top_largest_nonxlm),
 * round a specific numeric field (like "nonxlm_amount") to the given decimals,
 * then re-stringify.
 * @param {string} jsonStr - The JSON string of transaction details
 * @param {number} amountField - The name of the field to round
 * @param {number} decimals - The number of decimal places to round to
 * @returns {string} - The rounded JSON string
 */
function roundArrayAmounts(jsonStr, amountField, decimals) {
  if (!jsonStr) return jsonStr;
  try {
    const arr = JSON.parse(jsonStr);
    for (const item of arr) {
      if (typeof item[amountField] === 'number') {
        item[amountField] = round(item[amountField], decimals);
      }
    }
    return JSON.stringify(arr);
  } catch (err) {
    return jsonStr; // fallback if parse fails
  }
}

/**
 * Rounding helper: safely handle non-numbers without throwing errors.
 */
function round(value, decimals = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return value; // leave it as-is if it's not a number
  }
  // Round to 'decimals' places
  return Number(value.toFixed(decimals));
}

/**
 * A safer "fixBigQueryDates" that tries to parse the string and checks validity.
 * @param {object} obj - The object to fix
 * @returns {object} - The fixed object
 */
function fixBigQueryDates(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (!val) continue;

    if (typeof val === 'string') {
      const parsed = new Date(val);
      if (!Number.isNaN(parsed.getTime())) {
        // It’s a valid date string
        obj[key] = parsed;
      }
    } else if (Array.isArray(val)) {
      val.forEach((item) => fixBigQueryDates(item));
    } else if (typeof val === 'object') {
      fixBigQueryDates(val);
    }
  }
}

/**
 * If your new JSON has "YYYY-MM-DD" but you want "YYYY-MM", do:
 * @param {object} obj - The object to reformat
 * @returns {object} - The reformatted object
 */
function reformatMostActiveMonth(obj) {
  if (obj.most_active_month instanceof Date) {
    // e.g. 2024-03-01 => (2024-03)
    const dt = obj.most_active_month;
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
    obj.most_active_month = `${year}-${month}`;
  }
}


/**
 * Insert a "missing" wallet doc if BigQuery had no results.
 * @param {string} address - The user’s Stellar account ID
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
 * Create a new summary doc in MongoDB, using the mapped summaryData.
 * @param {object} summaryData - The mapped summary data
 * @returns {Promise<object>} - The created summary object
 */
const createWalletSummary = async (summaryData) => {
  const summary = await WalletSummary.create(summaryData);
  const plainSummary = summary.toObject();
  delete plainSummary._id;
  delete plainSummary.__v;
  return plainSummary;
};

/**
 * Try to find an existing summary doc in MongoDB.
 * @param {string} address - The user’s Stellar account ID
 * @returns {Promise<object>} - The found summary object or null
 */
const findWalletSummary = async (address) => {
  const summary = await WalletSummary.findOne({ account: address }).lean();
  if (summary) {
    delete summary._id;
    delete summary.__v;
  }
  return summary;
};

module.exports = {
  getAccountActivitySummary,
};
