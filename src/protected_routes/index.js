import { Router } from "express";
import jwt from "jsonwebtoken";
import config from "../config.json";

export default function(req, res, next) {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }

  // verifies secret and checks exp
  jwt.verify(token, config.jwtSecret, function(err, decoded) {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Failed to authenticate token."
      });
    } else {
      // if everything is good, save to request for use in other routes
      req.token = decoded;
      next();
    }
  });
}
