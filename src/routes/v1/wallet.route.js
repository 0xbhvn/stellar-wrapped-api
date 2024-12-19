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
 *                 total_transactions:
 *                   type: integer
 *                   description: Total number of transactions
 *                 total_sent_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount sent
 *                 total_received_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount received
 *                 unique_wallet_transfers:
 *                   type: integer
 *                   description: Number of unique wallets interacted with
 *                 most_active_day:
 *                   type: string
 *                   format: date
 *                   description: The day with the most transactions
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
 *                   description: Wallet interacted with the most
 *                 total_interaction_count:
 *                   type: integer
 *                   description: Total interactions with the top interaction wallet
 *                 top_5_transactions_by_category:
 *                   type: string
 *                   description: Top 5 transaction categories with their counts
 *                 total_selling_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount sold in XLM equivalent
 *                 total_buying_amount:
 *                   type: number
 *                   format: double
 *                   description: Total amount bought in XLM equivalent
 *                 net_pnl:
 *                   type: number
 *                   format: double
 *                   description: Net profit and loss in XLM equivalent
 *                 token_balance:
 *                   type: number
 *                   format: double
 *                   description: Token balance of the account
 *                 first_transaction_date:
 *                   type: string
 *                   format: date
 *                   description: Date of the first transaction
 *                 last_transaction_date:
 *                   type: string
 *                   format: date
 *                   description: Date of the most recent transaction
 *                 time_on_chain_days:
 *                   type: integer
 *                   description: Number of days active on the blockchain
 *               example:
 *                 account: "GABC1234DEF5678"
 *                 total_transactions: 100
 *                 total_sent_amount: 1500.75
 *                 total_received_amount: 3000.25
 *                 unique_wallet_transfers: 15
 *                 most_active_day: "2023-10-01"
 *                 most_active_day_count: 10
 *                 most_active_month: "2023-10"
 *                 monthly_transaction_count: 50
 *                 top_interaction_wallet: "GXYZ1234ABCD5678"
 *                 total_interaction_count: 20
 *                 top_5_transactions_by_category: "payment: 30, path_payment: 15, create_account: 5"
 *                 total_selling_amount: 5000.50
 *                 total_buying_amount: 7500.75
 *                 net_pnl: -2000.25
 *                 token_balance: 10000.00
 *                 first_transaction_date: "2023-01-01"
 *                 last_transaction_date: "2023-10-01"
 *                 time_on_chain_days: 100
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
