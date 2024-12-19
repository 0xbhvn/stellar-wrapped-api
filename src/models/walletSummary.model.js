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
      // required: true,
      default: null, // Default for missing wallets
    },
    most_active_day_count: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    most_active_month: {
      type: String, // YYYY-MM format
      // required: true,
      default: 'N/A', // Default for missing wallets
    },
    monthly_transaction_count: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
    },
    top_interaction_wallet: {
      type: String,
      required: false,
      default: null, // Default for missing wallets
    },
    total_interaction_count: {
      type: Number,
      required: false,
      default: 0, // Default for missing wallets
    },
    top_5_transactions_by_category: {
      type: String, // Store as JSON string
      required: false,
      default: '[]', // Default as empty array
    },
    total_selling_amount: {
      type: Number,
      required: false,
      default: 0, // Default for missing wallets
    },
    total_buying_amount: {
      type: Number,
      required: false,
      default: 0, // Default for missing wallets
    },
    net_pnl: {
      type: Number,
      required: false,
      default: 0, // Default for missing wallets
    },
    token_balance: {
      type: Number,
      required: false,
      default: 0, // Default for missing wallets
    },
    first_transaction_date: {
      type: Date, // Store as Date
      // required: true,
      default: null, // Default for missing wallets
    },
    last_transaction_date: {
      type: Date, // Store as Date
      // required: true,
      default: null, // Default for missing wallets
    },
    time_on_chain_days: {
      type: Number,
      required: true,
      default: 0, // Default for missing wallets
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
