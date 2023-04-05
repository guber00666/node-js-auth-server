import { NextFunction, Request, Response } from "express";
import Types from "../types";

const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (
  req: Request<Types.UserPayload>,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("Token is not correct");
  }
  try {
    req.body.token = jwt.verify(token, config.TOKEN_KEY);
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
  return next();
};

module.exports = verifyToken;
