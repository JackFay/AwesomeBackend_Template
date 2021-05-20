import { version } from "../../../package.json";
import { Router } from "express";
import * as authentication from "./lib/authentication";
import moment from "moment";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bjcgroup2019@gmail.com",
    pass: "MuchaSuerte1!",
  },
});
export default ({ config, db }) => {
  let api = Router();

  // perhaps expose some API metadata at the root
  api.get("/", (req, res) => {
    res.send({ version });
  });

  api.post("/newUser", (req, res) => {
    let user = {
      email: req.body.email,
      phone: req.body.phone,
      legal_name: req.body.legalName,
      password_hash: req.body.password,
      dob: req.body.dob,
      phone: req.body.phone,
    };

    authentication.newUser(user, res);
  });

  api.post("/login", (req, res) => {
    const emailOrPhone = req.body.email;
    const password = req.body.password;

    authentication.login(emailOrPhone, password, res);
  });

  api.post("/signup", async (req, res) => {
    const email = req.body.email;
    const domain = req.body.domain;
    const created_at = new moment().unix();
    const activation_key = "testpass123";

    const signUpSQL = `INSERT INTO signups (domain, email, activation_key, created_at) VALUES('${domain}', '${email}', '${activation_key}', ${created_at})`;
    await db.query(signUpSQL);
    const mailOptions = {
      from: "jfay@yahoo.com",
      to: "jrfay08@gmail.com",
      subject: "New Customer",
      text: `Thanks for registering your domain: ${domain}\n Your activation key is: ${activation_key} and will expire in 30 minutes`,
    };
    try {
      await transporter.sendMail(mailOptions, function (error, info) {});
    } catch (err) {
      console.log(err);
    }
    return res.send("success");
  });

  api.post("/admin/verify", async (req, res) => {
    const { email, authenticationKey, domain } = req.body;

    const verifySql = `SELECT * FROM signups WHERE domain='${domain}' AND activation_key='${authenticationKey}'`;
    const results = await db.query(verifySql);
    if (results.length === 1) {
      return res.send({ success: true });
    } else {
      return res.status(403).send("Access Denied");
    }
  });

  return api;
};
