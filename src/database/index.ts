import { Error } from "mongoose";
const mongoose = require("mongoose");
const { MONGO_URI } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.warn("Database successfully connected");
    })
    .catch((error: Error) => {
      console.error("Fail to connect database", error);
      process.exit(1);
    });
};
