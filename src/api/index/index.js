import { version } from "../../../package.json";
import { Router } from "express";
import * as authentication from "./lib/authentication";

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
      phone: req.body.phone
    };

    authentication.newUser(user, res);
  });

  api.post("/login", (req, res) => {
    const emailOrPhone = req.body.email;
    const password = req.body.password;

    authentication.login(emailOrPhone, password, res);
  });

  api.post("/signup", (req, res) => {
    const email = req.body.email;
    authentication.signUp(email, res);
  });

  return api;
};
