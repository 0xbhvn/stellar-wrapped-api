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
 *   description: Wallet management and retrieval
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
 *                 most_active_day:
 *                   type: string
 *                   description: The day with the most transactions
 *                 most_active_day_count:
 *                   type: integer
 *                   description: Number of transactions on the most active day
 *               example:
 *                 account: "GABC1234DEF5678"
 *                 total_transactions: 100
 *                 most_active_day: "2023-10-01"
 *                 most_active_day_count: 10
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
