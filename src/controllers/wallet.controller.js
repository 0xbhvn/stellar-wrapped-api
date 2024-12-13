const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const walletService = require('../services/wallet.service');

const getAccountActivitySummary = catchAsync(async (req, res) => {
  try {
    const { address } = req.params;
    const result = await walletService.getAccountActivitySummary(address);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = {
  getAccountActivitySummary,
};
