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
    total_transactions: {
      type: Number,
      required: true,
    },
    total_sent_amount: {
      type: Number,
      required: true,
    },
    total_received_amount: {
      type: Number,
      required: true,
    },
    unique_wallet_transfers: {
      type: Number,
      required: true,
    },
    most_active_day: {
      type: Date, // Store as Date
      required: true,
    },
    most_active_day_count: {
      type: Number,
      required: true,
    },
    most_active_month: {
      type: String, // YYYY-MM format
      required: true,
    },
    monthly_transaction_count: {
      type: Number,
      required: true,
    },
    top_interaction_wallet: {
      type: String,
      required: false,
    },
    total_interaction_count: {
      type: Number,
      required: false,
    },
    top_5_transactions_by_category: {
      type: String, // Store as a JSON string or an array if needed
      required: false,
    },
    total_selling_amount: {
      type: Number,
      required: false,
    },
    total_buying_amount: {
      type: Number,
      required: false,
    },
    net_pnl: {
      type: Number,
      required: false,
    },
    token_balance: {
      type: Number,
      required: false,
    },
    first_transaction_date: {
      type: Date, // Store as Date
      required: true,
    },
    last_transaction_date: {
      type: Date, // Store as Date
      required: true,
    },
    time_on_chain_days: {
      type: Number,
      required: true,
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
