const Joi = require('joi');

const addressParam = {
  params: Joi.object().keys({
    address: Joi.string()
      .length(56) // Stellar wallet addresses are always 56 characters long
      .regex(/^G[A-Z2-7]{55}$/) // Must start with 'G' and follow Stellar's base32 encoding
      .required()
      .messages({
        'string.length': 'Wallet address must be exactly 56 characters long.',
        'string.pattern.base': 'Wallet address must start with "G" and contain valid Stellar base32 characters.',
        'any.required': 'Wallet address is required.',
      }),
  }),
};

module.exports = {
  getAccountActivitySummary: addressParam,
};
