const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const walletSummarySchema = mongoose.Schema(
  {
    account: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isMissing: {
      type: Boolean,
      default: false, // Defaults to false for actual wallets
    },
    total_transactions: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    total_sent_amount: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    total_received_amount: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    unique_wallet_transfers: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    most_active_day: {
      type: Date, // Store as Date
      default: null, // Default for missing wallets
    },
    most_active_day_count: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    most_active_month: {
      type: String, // e.g., '2024-12'
      default: 'N/A',
    },
    monthly_transaction_count: {
      type: Number,
      required: true,
      default: 0,
    },
    top_interaction_wallet: {
      type: String,
      default: null,
    },
    total_interaction_count: {
      type: Number,
      required: false,
      default: 0,
    },
    top_5_transactions_by_category: {
      type: String, // store as JSON string, e.g., '["payment","path_payment_strict_send"]'
      default: '[]',
    },
    // optional PNL columns
    total_selling_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    total_buying_amount: {
      type: Number,
      required: false,
      default: 0,
    },
    net_pnl: {
      type: Number,
      required: false,
      default: 0,
    },
    // final token balance
    token_balance: {
      type: Number,
      required: false,
      default: 0,
    },
    first_transaction_date: {
      type: Date,
      default: null,
    },
    last_transaction_date: {
      type: Date,
      default: null,
    },
    time_on_chain_days: {
      type: Number,
      required: true,
      default: 0,
    },

    /**
     * NEW: largest_xlm_transaction_details
     * Storing as a JSON string (similar to top_5_transactions_by_category).
     * You can parse/stringify in your controller or service.
     */
    largest_xlm_transaction_details: {
      type: String,
      required: false,
      default: '{}', // empty object by default
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletSummarySchema.plugin(toJSON);

/**
 * @typedef WalletSummary
 */
const WalletSummary = mongoose.model('WalletSummary', walletSummarySchema);

module.exports = WalletSummary;
