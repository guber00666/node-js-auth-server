import * as crypto from "crypto";
import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

type IUser = {
  name: string;
  email: string;
  password: string;
  setPassword: (password: string) => void;
  validatePassword: (password: string) => void;
};

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512");
};

UserSchema.methods.validatePassword = function (password: string) {
  const localHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512");
  return this.hash === localHash;
};

const User = mongoose.model("Users", UserSchema);

export default User;
