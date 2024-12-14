| **Feature** | **API Endpoint** | **Logic/Description** | **Notes** | **Build Complexity** |
| --- | --- | --- | --- | --- |
| **Total Number of Transactions** | `/wallet/:address/total-transactions` | Count all transactions associated with the wallet. | Basic transaction count. | S (Small) |
| **Send vs. Receive Analysis** | `/wallet/:address/send-vs-receive` | Compare the total amount sent and received by the wallet and indicate if the wallet sent more than received, or vice versa. | Straightforward analysis of inflow vs. outflow for the wallet. | S (Small) |
| **Chain Duration** | `/wallet/:address/chain-duration` | Calculate the time elapsed since the wallet's first transaction. | Requires querying the first transaction timestamp for the wallet. | S (Small) |
| **Largest Transaction** | `/wallet/:address/largest-transaction` | Query all transactions for the wallet and find the one with the highest amount. | Use on-chain data to calculate the largest transaction amount. | M (Medium) |
| **Most Active Transaction Days** | `/wallet/:address/active-days` | Aggregate transactions by date and return the day(s) with the highest count of transactions. | Useful for identifying the most active dates of the wallet user. | M (Medium) |
| **Unique Wallet Transfers** | `/wallet/:address/unique-transfers` | Count distinct wallet addresses involved in sending/receiving transactions with the wallet. | Helps in understanding interaction diversity. | M (Medium) |
| **Top Interaction Wallet** | `/wallet/:address/top-interaction-wallet` | Find the wallet address with the highest number of interactions (sends or receives) with the target wallet. | Track user engagement with other wallets. | M (Medium) |
| **Token Portfolio Performance** | `/wallet/:address/token-performance` | Analyze token transactions to identify holdings, best-performing tokens, and duration of holding. | Requires tracking token value over time and calculating performance metrics like gains or losses. | L (Large) |
| **Transactions by Category** | `/wallet/:address/transaction-categories` | Categorize transactions into swaps, transfers, token interactions, etc., and return counts for each category. | On-chain metadata analysis required to classify transactions. | L (Large) |
| **Most Used Protocols or dApps** | `/wallet/:address/top-protocols` | Analyze transactions to identify the protocols, anchors, or dApps most frequently interacted with. | Requires protocol mapping logic to associate transaction metadata with specific dApps or protocols. | XL (Extra Large) |
| **P&L and Fee Savings** | `/wallet/:address/profit-loss` | Calculate profit/loss for tokens based on buy/sell activity and compare to what would have been spent in gas fees. | Needs token price history and gas cost benchmarks for comparison. | XL (Extra Large) |
| **NFTs Overview** | `/wallet/:address/nft-overview` | Analyze NFT transactions to summarize collections, costs, and best profit from sales. | NFT-specific metadata analysis required. | XL (Extra Large) |

### **Build Complexity Key**:

- **S (Small):** Straightforward queries with minimal processing.
- **M (Medium):** Requires basic data aggregation or filtering.
- **L (Large):** Complex analytics with multi-dimensional data processing.
- **XL (Extra Large):** Involves extensive computation, external data dependencies, or deep integrations.

### **Additional Notes:**

1. **Database for Cache**: Use the database as a cache for storing computed analytics (e.g., once a user’s analytics are computed, persist results for faster future queries).
2. **Query-Slug Design**: APIs should follow the structure `/{query-slug}/{wallet-address}` for simplicity and consistency.
3. **Deployment and Monitoring**: Use Railway for hosting the backend, with monitoring hooks (e.g., logs and performance metrics).
4. **API Priority**: Focus first on essential wallet analytics: largest transaction, total transactions, active days, and send vs. receive analysis.
5. **Timeline Considerations**: Stick to a single wallet per user for MVP, with plans to expand to multiple wallets in the next version.
