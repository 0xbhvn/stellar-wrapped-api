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
    most_active_day: {
      type: String,
      required: true,
    },
    most_active_day_count: {
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
