const Joi = require('joi');

const addressParam = {
  params: Joi.object().keys({
    address: Joi.string().required(),
  }),
};

module.exports = {
  getAccountActivitySummary: addressParam,
};
