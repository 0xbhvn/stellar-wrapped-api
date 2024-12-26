// src/models/walletSummary.model.js
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const walletSummarySchema = mongoose.Schema(
  {
    account: { type: String, required: true, unique: true, index: true },
    isMissing: { type: Boolean, default: false },

    // Transaction stats
    total_transactions: { type: Number, default: 0 },
    total_sent_xlm: { type: Number, default: 0 },
    total_received_xlm: { type: Number, default: 0 },
    total_selling_xlm: { type: Number, default: 0 },
    total_buying_xlm: { type: Number, default: 0 },
    net_pnl_xlm: { type: Number, default: 0 },

    // Time stats
    time_on_chain_days: { type: Number, default: 0 },
    first_txn_time: { type: Date, default: null },
    last_txn_time: { type: Date, default: null },

    // Collapsed JSON fields for last transaction
    last_transaction_details: { type: String, default: '{}' },
    last_nonxlm_transaction_details: { type: String, default: '{}' },
    last_xlm_transaction_details: { type: String, default: '{}' },

    // top arrays => also strings
    top_largest_nonxlm: { type: String, default: '[]' },
    top_largest_xlm: { type: String, default: '[]' },
    top_nonxlm_sent: { type: String, default: '[]' },
    top_nonxlm_received: { type: String, default: '[]' },
    top_nonxlm_selling: { type: String, default: '[]' },
    top_nonxlm_buying: { type: String, default: '[]' },

    // Interactions
    unique_wallet_interactions: { type: Number, default: 0 },
    top_interaction_wallet: { type: String, default: null },
    top_interaction_count: { type: Number, default: 0 },

    // Most active day/month
    most_active_day: { type: Date, default: null },
    most_active_day_count: { type: Number, default: 0 },
    most_active_month: { type: String, default: '' },
    most_active_month_count: { type: Number, default: 0 },
    top_5_transactions_by_category: { type: String, default: '' },

    // Balances
    token_balance: { type: Number, default: 0 },
    starting_balance: { type: Number, default: 0 },
    balance_diff: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// add plugin that converts mongoose documents to JSON
walletSummarySchema.plugin(toJSON);

const WalletSummary = mongoose.model('WalletSummary', walletSummarySchema);
module.exports = WalletSummary;
