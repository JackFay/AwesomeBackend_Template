import db from "./db";
import moment from "moment";
const phone = "+15734246735";
const now = new moment().unix();
const customerId = 1;

(async () => {
  const sql = `SELECT * FROM Transactions WHERE customer_id=${customerId} ORDER BY created_at`;
  const txs = await db.query(sql);

  let balances = {
    ETH: {
      amount: 0,
      avgPrice: 0,
      withdrawls: [],
      deposits: [],
      sumDeposits: 0,
      sumWithdrawls: 0,
    },
    BTC: {
      amount: 0,
      avgPrice: 0,
      withdrawls: [],
      deposits: [],
      sumDeposits: 0,
      sumWithdrawls: 0,
    },
    USDC: {
      amount: 0,
      avgPrice: 0,
      withdrawls: [],
      deposits: [],
      sumDeposits: 0,
      sumWithdrawls: 0,
    },
    DAI: {
      amount: 0,
      avgPrice: 0,
      withdrawls: [],
      deposits: [],
      sumDeposits: 0,
      sumWithdrawls: 0,
    },
    LTC: {
      amount: 0,
      avgPrice: 0,
      withdrawls: [],
      deposits: [],
      sumDeposits: 0,
      sumWithdrawls: 0,
    },
  };

  for (const tx of txs) {
    if (tx.tx_type === "deposit") {
      const newBalance = balances[tx.currency].amount
        ? balances[tx.currency].amount + tx.amount
        : tx.amount;
      balances[tx.currency].amount = newBalance;
      balances[tx.currency].deposits.push(tx);
    } else if (tx.tx_type === "withdrawl") {
      const newBalance = balances[tx.currency].amount - tx.amount;
      balances[tx.currency].amount = newBalance;
      balances[tx.currency].withdrawls.push(tx);

      let deposits = balances[tx.currency].deposits;
      let withdrawlBalance = tx.amount;
      // loop thru deposits, removing first deposit if withdrawl is greater
      while (withdrawlBalance > 0) {
        let newWithdrawlBalance = withdrawlBalance - deposits[0].amount;

        if (newWithdrawlBalance <= 0) {
          // means deposit amount is greater, but needs to be deducted
          deposits[0].amount = deposits[0].amount - withdrawlBalance;
          if (deposits[0].amount === 0) deposits.unshift();
        } else if (newWithdrawlBalance > 0) {
          // means deposit is insufficient, remove it
          deposits.unshift();
        }
        withdrawlBalance = newWithdrawlBalance;
      }
    }
  }

  for (const currency in balances) {
    const costBasis = balances[currency].deposits;
    let totalShares = 0;
    let totalCost = 0;
    for (const cost of costBasis) {
      totalShares += cost.amount;
      totalCost += cost.asset_price * cost.amount;
    }
    const avgCost = totalCost / totalShares;
    balances[currency].avgCost = avgCost;
  }

  console.log(balances["LTC"]);
})();
