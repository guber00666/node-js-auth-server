import { Request, Response } from "express";
import Types from "../types";
import User from "../database/shema";
import * as jwt from "jsonwebtoken";
require("dotenv").config();
require("../database").connect();
const { API_PORT, TOKEN_KEY } = process.env;
const port = process.env.PORT || API_PORT;

const express = require("express");
const auth = require("../middleware/auth");

const app = express();

const urlencodedParser = express.urlencoded({ extended: false });

app.post(
  "/register",
  urlencodedParser,
  (req: Request<Types.UserPayload>, res: Response) => {
    if (!req.body) return res.sendStatus(400).send("Bad request");
    User.exists({ email: req.body.email }).then((user) => {
      if (user) {
        return res
          .status(400)
          .send(`User with email ${req.body.email} already, exist!!!`);
      } else {
        const newUser = new User();
        const { name, email, password } = req.body;
        newUser.name = name;
        newUser.email = email;
        newUser.password = password;
        newUser.setPassword(password);
        newUser
          .save()
          .then((u) => {
            res.status(200).send({ name: u.name, email: u.email });
          })
          .catch((error) => {
            res.status(400).send({ error: error.message });
          });
      }
    });
  }
);

app.post(
  "/login",
  urlencodedParser,
  (req: Request<Types.UserPayload>, res: Response) => {
    if (!req.body) {
      return res.status(400).send("Bad request");
    }
    if (!(req.body.email && req.body.password)) {
      res.status(400).send("All input is required");
    }
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          const validPassword = user.validatePassword(user.password);
          if (!validPassword) {
            res.status(400).send({ message: "Password is not valid" });
          } else {
            const payload = {
              id: user._id,
              name: user.name,
              email: user.email,
              password: user.password,
            };
            if (TOKEN_KEY) {
              user.token = jwt.sign(payload, TOKEN_KEY);
              res.status(200).json({ ...payload, token: user.token });
            }
          }
        }
      })
      .catch((error) => {
        console.error("Fail to login", error);
      });
  }
);

app.post(
  "/app",
  urlencodedParser,
  auth,
  (req: Request<Types.UserPayload>, res: Response) => {
    console.log("req", req.body);
    res.status(200).send("Valid token");
  }
);

app.listen(3000, () => {
  `Server running on port ${port}`;
});
