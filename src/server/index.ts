import { Request, Response } from "express";
import DataBase from "../db";
import Types from "../types";

const express = require("express");

const db = new DataBase();

const app = express();

db.connect();

const urlencodedParser = express.urlencoded({ extended: false });

app.post(
  "/register",
  urlencodedParser,
  (req: Request<Types.UserPayload>, res: Response) => {
    if (!req.body) return res.sendStatus(400);
    db.checkUserExist(req.body.email).then((user) => {
      if (user) {
        return res
          .status(400)
          .send(`User with email ${req.body.email} already, exist!!!`);
      } else {
        db.register(req.body).then((u) => {
          return res.status(200).send(u);
        });
      }
    });
  }
);

app.post(
  "/login",
  urlencodedParser,
  (req: Request<Types.UserPayload>, res: Response) => {
    if (!req.body) return res.sendStatus(400);
    db.login(req.body.email, req.body.password)
      .then((token) => {
        return res.status(200).send({ token });
      })
      .catch((e) => {
        return res.status(401).send(e);
      });
  }
);

app.listen(3000);

process.on("SIGINT", db.disconnect);
process.on("SIGTERM", db.disconnect);
