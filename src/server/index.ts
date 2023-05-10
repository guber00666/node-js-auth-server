import { Request, Response } from "express";
import Types from "../types";
import User from "../database/shema";
import * as jwt from "jsonwebtoken";
import * as bodyParser from "body-parser";
const cors = require("cors");
require("dotenv").config();
require("../database").connect();
const { API_PORT, TOKEN_KEY } = process.env;
const port = process.env.PORT || API_PORT;

const express = require("express");
const auth = require("../middleware/auth");

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const jsonParser = bodyParser.json();

app.use(urlencodedParser);
app.use(jsonParser);
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));

app.post(
  "/register",
  function (req: Request<Types.UserPayload>, res: Response) {
    if (!req.body) return res.sendStatus(400).json({ message: `Bad request ` });

    return User.exists({ email: req.body.email }).then((user) => {
      if (user) {
        return res.status(400).send({
          message: `Пользователь с адресом почты ${req.body.email} уже зарегистрирован!`,
        });
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
            return res.status(200).send({ name: u.name, email: u.email });
          })
          .catch((error) => {
            return res.status(400).send({ error: error.message });
          });
      }
    });
  }
);

app.post("/login", function (req: Request<Types.UserPayload>, res: Response) {
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
            user.token = jwt.sign(payload, TOKEN_KEY, {
              expiresIn: "1h",
            });
            res.status(200).json({ ...payload, token: user.token });
          }
        }
      }
    })
    .catch((error) => {
      console.error("Fail to login", error);
    });
});

app.post(
  "/app",
  urlencodedParser,
  auth,
  (req: Request<Types.IUser["token"]>, res: Response) => {
    if (TOKEN_KEY) {
      res.status(200).send(req.body);
    } else {
      res.status(400).send({ message: "Not have a secret key..." });
    }
  }
);

// User.deleteMany({});

app.listen(API_PORT, () => {
  `Server running on port ${port}`;
});
