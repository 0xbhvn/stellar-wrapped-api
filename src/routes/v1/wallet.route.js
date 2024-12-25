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
 *     description: Retrieve the activity summary for a specific wallet address.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet address
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 account:
 *                   type: string
 *                   description: Wallet address
 *                 isMissing:
 *                   type: boolean
 *                   description: Indicates if the wallet is missing (not found) in the system
 *                 total_transactions:
 *                   type: integer
 *                   description: Total number of transactions that this wallet has performed
 *                 total_sent_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount sent (XLM or XLM-equivalent)
 *                 total_received_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount received (XLM or XLM-equivalent)
 *                 unique_wallet_transfers:
 *                   type: integer
 *                   description: Number of unique wallets this wallet has interacted with
 *                 most_active_day:
 *                   type: string
 *                   format: date-time
 *                   description: The UTC date (YYYY-MM-DD or date-time) with the most transactions
 *                 most_active_day_count:
 *                   type: integer
 *                   description: Number of transactions on the most active day
 *                 most_active_month:
 *                   type: string
 *                   description: The month with the most transactions (YYYY-MM format)
 *                 monthly_transaction_count:
 *                   type: integer
 *                   description: Number of transactions in the most active month
 *                 top_interaction_wallet:
 *                   type: string
 *                   description: Wallet address this wallet interacted with the most
 *                 total_interaction_count:
 *                   type: integer
 *                   description: Total interactions with the `top_interaction_wallet`
 *                 top_5_transactions_by_category:
 *                   type: string
 *                   description: Top 5 transaction categories (comma-separated counts)
 *                 total_selling_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount sold (in XLM equivalent)
 *                 total_buying_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount bought (in XLM equivalent)
 *                 net_pnl:
 *                   type: number
 *                   format: double
 *                   description: Net profit/loss in XLM equivalent
 *                 starting_balance:
 *                   type: number
 *                   format: double
 *                   description: Earliest recorded balance within the date range
 *                 token_balance:
 *                   type: number
 *                   format: double
 *                   description: Latest (current) recorded balance within the date range
 *                 balance_diff:
 *                   type: number
 *                   format: double
 *                   description: Difference between latest balance and earliest balance
 *                 first_transaction_date:
 *                   type: string
 *                   format: date-time
 *                   description: Date of the first recorded transaction (UTC)
 *                 last_transaction_date:
 *                   type: string
 *                   format: date-time
 *                   description: Date of the most recent recorded transaction (UTC)
 *                 time_on_chain_days:
 *                   type: integer
 *                   description: Number of days since first transaction (inclusive)
 *                 largest_xlm_transaction_details:
 *                   type: string
 *                   description: JSON string containing details for the largest XLM transaction
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp (UTC) when the summary document was created in MongoDB
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp (UTC) when the summary document was last updated in MongoDB
 *               example:
 *                 account: "GB3FQB7JYQ37PVYL3DE7ZWYMQCDXZFQBLA23HHJOYA3MIOHCSLT3BCYY"
 *                 isMissing: false
 *                 total_transactions: 3750242
 *                 total_sent_amount: 178051585.23
 *                 total_received_amount: 0
 *                 unique_wallet_transfers: 1629
 *                 most_active_day: "2024-03-25T00:00:00.000Z"
 *                 most_active_day_count: 14262
 *                 most_active_month: "2024-05"
 *                 monthly_transaction_count: 390396
 *                 top_interaction_wallet: "GA75XHISXU5Q5QXTLDCORNJUTK6PEHL7KC7HWQPTRQP7I54S3H4R576U"
 *                 total_interaction_count: 8581
 *                 top_5_transactions_by_category: "manage_sell_offer: 3442085, manage_buy_offer: 3357330, payment: 803, create_account: 1"
 *                 total_selling_amount: 213485877.79
 *                 total_buying_amount: 61049734.6
 *                 net_pnl: -152436143.19
 *                 starting_balance: 511659.64
 *                 token_balance: 927058.58
 *                 balance_diff: 415398.94
 *                 first_transaction_date: "2024-01-01T00:00:00.000Z"
 *                 last_transaction_date: "2024-12-24T00:00:00.000Z"
 *                 time_on_chain_days: 359
 *                 largest_xlm_transaction_details: "{\"amount\":762774.555,\"asset_code\":\"XLM\",\"operation_count\":1,\"transaction_id\":234136929508077568,\"txn_date\":\"2024-11-22\",\"type_string\":\"payment\"}"
 *                 createdAt: "2024-12-25T02:00:59.534Z"
 *                 updatedAt: "2024-12-25T02:00:59.534Z"
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
