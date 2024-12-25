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
      // required: true,
      default: 0,
    },
    total_sent_amount: {
      type: Number,
      // required: true,
      default: 0,
    },
    total_received_amount: {
      type: Number,
      // required: true,
      default: 0,
    },
    unique_wallet_transfers: {
      type: Number,
      // required: true,
      default: 0,
    },
    most_active_day: {
      type: Date,
      default: null,
    },
    most_active_day_count: {
      type: Number,
      // required: true,
      default: 0,
    },
    most_active_month: {
      type: String, // e.g. '2024-12'
      default: 'N/A',
    },
    monthly_transaction_count: {
      type: Number,
      // required: true,
      default: 0,
    },
    top_interaction_wallet: {
      type: String,
      default: null,
    },
    total_interaction_count: {
      type: Number,
      default: 0,
    },
    top_5_transactions_by_category: {
      type: String, // store as JSON string, e.g. '["payment","path_payment_strict_send"]'
      default: '[]',
    },
    // -- PNL columns:
    total_selling_amount: {
      type: Number,
      default: 0,
    },
    total_buying_amount: {
      type: Number,
      default: 0,
    },
    net_pnl: {
      type: Number,
      default: 0,
    },
    // -- “Token ownership” columns, if you want them individually
    token_balance: {
      type: Number,
      default: 0,
    },
    // OR if you want “starting_balance” / “current_balance” / “balance_diff”:
    starting_balance: {
      type: Number,
      default: 0,
    },
    // current_balance: {
    //   type: Number,
    //   default: 0,
    // },
    balance_diff: {
      type: Number,
      default: 0,
    },

    // -- Transaction date range columns:
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
      // required: true,
      default: 0,
    },

    // -- Largest XLM transaction details as a JSON string
    largest_xlm_transaction_details: {
      type: String,
      default: '{}', // empty JSON object by default
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose documents to JSON
walletSummarySchema.plugin(toJSON);

/**
 * @typedef WalletSummary
 */
const WalletSummary = mongoose.model('WalletSummary', walletSummarySchema);

module.exports = WalletSummary;
