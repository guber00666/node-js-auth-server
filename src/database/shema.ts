import * as crypto from "crypto";
import * as mongoose from "mongoose";
import Types from "../types";

const Schema = mongoose.Schema;

const UserSchema = new Schema<Types.IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  hash: String,
  salt: String,
  token: String,
});

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString(`hex`);
};

UserSchema.methods.validatePassword = function (password: string) {
  const localHash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.hash === localHash;
};

const User = mongoose.model("Users", UserSchema);

export default User;
