import { Request, Response } from "express";
import DataBase from "../db";

const express = require("express");

const db = new DataBase();

const app = express();

db.connect();

const urlencodedParser = express.urlencoded({ extended: false });

app.get("/", function (req: Request, res: Response) {
  res.send("Hello World");
  console.warn("Server was started on localhost: 3000");
});

app.post("/register", urlencodedParser, (req: Request, res: Response) => {
  if (!req.body) return res.sendStatus(400);
  db.checkUserExist(req.body.email).then((user) => {
    console.log("user", req.body);
    if (user) {
      console.error(`User with email ${req.body.email} already, exist!!!`);
    } else {
      db.register(req.body);
    }
  });
  return res.send(req.body);
});

// db.clear();

db.getUser("fess00666");

app.listen(3000);

process.on("SIGINT", db.disconnect);
process.on("SIGTERM", db.disconnect);
