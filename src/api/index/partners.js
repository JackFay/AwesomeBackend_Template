import { Router } from "express";
import moment from "moment";

export default ({ config, db }) => {
  let api = Router();

  api.post("/offers", async (req, res) => {
    const {
      discount,
      capitalGainFee,
      expiresAt,
      minimumInvestment,
      maximumInvestment,
      numAvailable,
      partnerId,
    } = req.body;
    const createdAt = new moment().unix();
    const values = [
      [
        partnerId,
        parseFloat(discount),
        parseFloat(capitalGainFee),
        expiresAt,
        createdAt,
        parseFloat(minimumInvestment),
        parseFloat(maximumInvestment),
        numAvailable,
      ],
    ];
    const sql = `INSERT INTO offers (partner_id, discount, capital_gain_fee, expires_at, created_at, minimumInvestment, maximumInvestment, num_available ) VALUES ?`;

    const result = await db.query(sql, [values]);
    return res.send(result);
  });

  api.get("/offers", async (req, res) => {
    const sql = `SELECT * FROM offers;`;
    const offers = await db.query(sql);

    return res.send(offers);
  });

  return api;
};
