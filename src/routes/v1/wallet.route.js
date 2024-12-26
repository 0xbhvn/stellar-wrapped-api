const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const walletValidation = require('../../validations/wallet.validation');
const walletController = require('../../controllers/wallet.controller');

const router = express.Router();

router.get('/:address/activity-summary', validate(walletValidation.getAccountActivitySummary), walletController.getAccountActivitySummary);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet summary retrieval
 */

/**
 * @swagger
 * /wallet/{address}/activity-summary:
 *   get:
 *     summary: Get account activity summary
 *     description: Retrieve the activity summary for a specific wallet address, including transaction metrics, XLM P&L, last transactions, top non-XLM assets, and more.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: The Stellar account ID (G...)
 *     responses:
 *       "200":
 *         description: Wallet summary successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account:
 *                   type: string
 *                   description: The Stellar account ID
 *                 isMissing:
 *                   type: boolean
 *                   description: Indicates if the wallet is missing (true) or found (false)
 *                 total_transactions:
 *                   type: integer
 *                   description: Total number of distinct transactions by this account
 *                 total_sent_xlm:
 *                   type: number
 *                   format: double
 *                   description: Total XLM (rounded) sent by this account
 *                 total_received_xlm:
 *                   type: number
 *                   format: double
 *                   description: Total XLM (rounded) received by this account
 *                 total_selling_xlm:
 *                   type: number
 *                   format: double
 *                   description: Total XLM put up for sell offers (rounded)
 *                 total_buying_xlm:
 *                   type: number
 *                   format: double
 *                   description: Total XLM put up for buy offers (rounded)
 *                 net_pnl_xlm:
 *                   type: number
 *                   format: double
 *                   description: Net P&L (profit or loss) in XLM (rounded)
 *                 time_on_chain_days:
 *                   type: integer
 *                   description: The number of days since the first transaction
 *                 first_txn_time:
 *                   type: string
 *                   format: date-time
 *                   description: Date/time (UTC) of the earliest recorded transaction
 *                 last_txn_time:
 *                   type: string
 *                   format: date-time
 *                   description: Date/time (UTC) of the most recent recorded transaction
 *                 last_transaction_details:
 *                   type: string
 *                   description: JSON string with details of the last (any) transaction. E.g. `{"id":..., "op_type_int":..., "timestamp":"...","amount":...}`
 *                 last_nonxlm_transaction_details:
 *                   type: string
 *                   description: JSON string with details of the last non-XLM transaction
 *                 last_xlm_transaction_details:
 *                   type: string
 *                   description: JSON string with details of the last XLM transaction
 *                 top_largest_nonxlm:
 *                   type: string
 *                   description: JSON array of objects representing the largest non-XLM transaction(s)
 *                 top_largest_xlm:
 *                   type: string
 *                   description: JSON array of objects representing the largest XLM transaction(s)
 *                 top_nonxlm_sent:
 *                   type: string
 *                   description: JSON array of objects showing top non-XLM asset(s) by sent volume
 *                 top_nonxlm_received:
 *                   type: string
 *                   description: JSON array of objects showing top non-XLM asset(s) by received volume
 *                 top_nonxlm_selling:
 *                   type: string
 *                   description: JSON array of objects showing top non-XLM asset(s) by sell offers
 *                 top_nonxlm_buying:
 *                   type: string
 *                   description: JSON array of objects showing top non-XLM asset(s) by buy offers
 *                 unique_wallet_interactions:
 *                   type: integer
 *                   description: How many unique other wallets this account has interacted with
 *                 top_interaction_wallet:
 *                   type: string
 *                   description: The wallet address with the highest number of interactions
 *                 top_interaction_count:
 *                   type: integer
 *                   description: Number of interactions with the top_interaction_wallet
 *                 most_active_day:
 *                   type: string
 *                   format: date-time
 *                   description: The date (UTC) with the highest transaction count
 *                 most_active_day_count:
 *                   type: integer
 *                   description: Number of transactions on that most active day
 *                 most_active_month:
 *                   type: string
 *                   description: The month with the highest transaction count (formatted as YYYY-MM)
 *                 most_active_month_count:
 *                   type: integer
 *                   description: Number of transactions in the most active month
 *                 top_5_transactions_by_category:
 *                   type: string
 *                   description: A comma-separated string of up to 5 operation types with their counts
 *                 token_balance:
 *                   type: number
 *                   format: double
 *                   description: The latest XLM account balance (rounded)
 *                 starting_balance:
 *                   type: number
 *                   format: double
 *                   description: The earliest XLM account balance within the date range
 *                 balance_diff:
 *                   type: number
 *                   format: double
 *                   description: The difference (latest - earliest) in XLM balance
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp (UTC) of when this record was inserted into MongoDB
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp (UTC) of when this record was last updated in MongoDB
 *               example:
 *                 account: "GAS2EAREA5VSJ6Y4RJLV7Y2FSTXNHOC455NKNP3DM5CULXDFMB5OSGOD"
 *                 isMissing: false
 *                 total_transactions: 3912
 *                 total_sent_xlm: 226080.17
 *                 total_received_xlm: 0
 *                 total_selling_xlm: 0
 *                 total_buying_xlm: 0
 *                 net_pnl_xlm: 0
 *                 time_on_chain_days: 359
 *                 first_txn_time: "2024-01-01T03:01:55.000Z"
 *                 last_txn_time: "2024-12-24T20:08:18.000Z"
 *                 last_transaction_details: "{\"id\":\"236110153446641664\",\"op_type_int\":1,\"op_type_str\":\"payment\",\"timestamp\":\"2024-12-24T20:08:18Z\",\"asset_code\":null,\"amount\":50}"
 *                 last_nonxlm_transaction_details: "{\"id\":\"236086282018091008\",\"op_type_int\":1,\"op_type_str\":\"payment\",\"timestamp\":\"2024-12-24T11:01:59Z\",\"asset_code\":\"yUSDC\",\"amount\":0.02}"
 *                 last_xlm_transaction_details: "{\"id\":\"236110153446641664\",\"op_type_int\":1,\"op_type_str\":\"payment\",\"timestamp\":\"2024-12-24T20:08:18Z\",\"asset_code\":null,\"amount\":50}"
 *                 top_largest_nonxlm: "[{\"nonxlm_asset_code\":\"AQUA\",\"nonxlm_amount\":184000,\"nonxlm_op_type_int\":1,\"nonxlm_op_type_str\":\"payment\",\"tx_id\":\"223078118863888384\",\"tx_time\":\"2024-06-02T06:48:12Z\"}]"
 *                 top_largest_xlm: "[{\"xlm_asset_code\":null,\"xlm_amount\":10000,\"xlm_op_type_int\":1,\"xlm_op_type_str\":\"payment\",\"tx_id\":\"221543926480769024\",\"tx_time\":\"2024-05-08T13:14:11Z\"}]"
 *                 top_nonxlm_sent: "[{\"code\":\"AQUA\",\"total_sent\":2359777.01}]"
 *                 top_nonxlm_received: "[]"
 *                 top_nonxlm_selling: "[]"
 *                 top_nonxlm_buying: "[{\"code\":\"EURC\",\"total_buying\":120}]"
 *                 unique_wallet_interactions: 661
 *                 top_interaction_wallet: "GANESLOXBZWPLB5ZM2KFUTBGSBGISB7JTWFXO67G4TGQINWRMI6766GV"
 *                 top_interaction_count: 721
 *                 most_active_day: "2024-09-29T00:00:00.000Z"
 *                 most_active_day_count: 460
 *                 most_active_month: "2024-09"
 *                 most_active_month_count: 728
 *                 top_5_transactions_by_category: "payment: 3349, create_account: 558, claim_claimable_balance: 12, manage_buy_offer: 3, change_trust: 2"
 *                 token_balance: 21708.24
 *                 starting_balance: 6552.26
 *                 balance_diff: 15155.99
 *                 createdAt: "2024-12-26T01:44:24.253Z"
 *                 updatedAt: "2024-12-26T01:44:24.253Z"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
