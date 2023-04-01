import Types from "../types";
import User from "./shema";
import { Error } from "mongoose";
import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";

const SECRET_KEY = "auth-server-node-js-secret";

class DataBase {
  readonly url = "mongodb://127.0.0.1:27017";

  public connect = async () => {
    try {
      await mongoose.connect(this.url);
    } catch (e) {
      console.error("Error to connect db", e);
    }
  };

  public disconnect = () => {
    mongoose.disconnect().then(() => {
      console.warn("Successfully disconnected");
    });
  };

  public checkUserExist = (email: string) => {
    return User.exists({ email });
  };

  public login = async (
    email: string,
    password: string
  ): Promise<string | Error> => {
    return User.findOne({ email }).then((user) => {
      return new Promise((resolve, reject) => {
        if (user) {
          const validPassword = user.validatePassword(password);
          if (!validPassword) {
            reject(new Error("Email or password not valid"));
          } else {
            const payload = {
              id: user._id,
              name: user.name,
              email: user.email,
              password: user.password,
            };
            resolve(jwt.sign(payload, SECRET_KEY));
          }
        }
      });
    });
  };

  public register = async (
    payload: Types.UserPayload
  ): Promise<Types.UserPayload | Error | void> => {
    const newUser = new User();
    try {
      newUser.name = payload.name;
      newUser.email = payload.email;
      newUser.password = payload.password;
      newUser.setPassword(payload.password);
      newUser.save();
      return newUser;
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
    }
  };
}

export default DataBase;
