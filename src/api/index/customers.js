import { Router } from "express";
import { sanitizePhone, sendTwilio } from "./lib/twilio";
import config from "../../config.json";
import moment from "moment";
import jwt from "jsonwebtoken";
import { Webhook } from "coinbase-commerce-node";
import protectedRoute from "../../protected_routes";

export default ({ config, db }) => {
  let api = Router();

  api.post("/signup", async (req, res) => {
    const { phone, email, username } = req.body;
    if (!phone && !email)
      return res.status(400).send("Phone or email must be provided");
    const createdAt = new moment().unix();
    const code = Math.floor(100000 + Math.random() * 900000);

    const sql = `INSERT INTO Customers (phone, email, username, verification_code, created_at) VALUES ('${phone}', '${
      email || null
    }', '${username}', ${code}, ${createdAt})`;
    const result = await db.query(sql);
    if (phone) {
      console.log("Your verification code is:", code);

      //   sendTwilio(
      //     `Thank you for signing up, your verification code is: ${code}`,
      //     phone
      //   );
    }
    return res.send("success");
  });

  api.post("/login", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).send("Phone must be provided");

    const sql = `SELECT * FROM Customers WHERE phone=${phone}`;
    const customer = await db.query(sql);
    if (!customer) return res.status(400).send("Account not found.");

    const newCode = Math.floor(100000 + Math.random() * 900000);
    const updateCodeSql = `UPDATE Customers SET verification_code=${newCode} WHERE phone=${phone}`;
    const updateResult = await db.query(updateCodeSql);
    if (phone) {
      console.log("Your verification code is:", newCode);
      //sendTwilio(`Your verification code is: ${newCode}`, phone);
    }
    return res.send("success");
  });

  api.post("/verify", async (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) return res.status(403).send("Access Denied.");

    const sql = `SELECT * FROM Customers WHERE phone='${phone}' AND verification_code=${code}`;
    const result = await db.query(sql);

    if (!result || result.length !== 1)
      return res.status(403).send("Access Denied.");
    const customerId = result[0].id;
    const userPayload = {
      phone,
      customerId,
    };

    const token = jwt.sign(userPayload, config.jwtSecret, {
      expiresIn: 60 * 60,
    });

    return res.send({ token, phone, customerId });
  });

  api.post("/deposit", async (req, res) => {
    let event;
    try {
      event = Webhook.verifyEventBody(
        JSON.stringify(req.body),
        req.headers["x-cc-webhook-signature"],
        config.coinbaseSharedSecret
      );
    } catch (err) {
      console.log(err);
      return res.status(400).send(`Unauthorized: ${err}`);
    }
    if (req.body.event.type !== "charge:confirmed") {
      return res.send("not a charge confirmed req");
    }
    const { metadata, payments, hosted_url } = req.body.event.data;
    const { phone, customerId } = metadata;
    const payment = payments[0].value;
    if (payment) {
      const amount = payment.local.amount;
      const { local, crypto } = payment;
      const assetPrice = amount / crypto.amount;
      const now = new moment().unix();
      let userTransaction = {
        type: "deposit",
        transactionId: payments[0].transaction_id,
        hostedUrl: hosted_url,
      };

      const { transactionId, hostedUrl } = userTransaction;
      const txSql = `INSERT INTO Transactions (customer_id, tx_type, currency, amount, asset_price, coinbase_tx_id, hosted_url, created_at) VALUES (${customerId}, 'deposit', '${crypto.currency}', ${crypto.amount}, ${assetPrice}, '${transactionId}', '${hostedUrl}', ${now})`;
      const txResult = await db.query(txSql);

      console.log(`A deposit of ${amount} has been credited to your account!`);
      sendTwilio(
        `A deposit of ${amount} has been credited to your account!`,
        phone
      );

      return res.status(200).send(req.body);
    }
  });

  api.post("/withdraw", protectedRoute, async (req, res) => {
    const { customerId } = req.token;
    const { amount, address } = req.body;
    const createdAt = new moment().unix();

    const withdrawSql = `INSERT INTO Transactions (customer_id, tx_type, currency, amount, address, created_at) VALUES (${customerId}, 'withdrawl', '${currency}', '${amount}', '${address}', ${createdAt})`;
    const result = await db.query(withdrawSql);

    return res.send("Withdrawl request submitted");
  });

  api.get("/account/transactions", protectedRoute, async (req, res) => {
    const { customerId } = req.token;
    const sql = `SELECT * FROM Transactions WHERE customer_id=${customerId}`;
    const txs = await db.query(sql);
    return res.send(txs);
  });

  api.get("/account/balances", protectedRoute, async (req, res) => {
    const { customerId } = req.token;
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

    return res.send(balances);
  });

  return api;
};
