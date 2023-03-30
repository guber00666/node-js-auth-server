import * as mongoose from "mongoose";
import Types from "../types";
import User from "./shema";
import { Error } from "mongoose";

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

  public checkUserExist = async (email: string) => {
    try {
      return await User.exists({ email });
    } catch (e) {
      console.error("Error to check", e);
    }
  };

  public login = async (email: string) => {
    return User.findOne({ email })
      .then((user) => {
        return new Promise((resolve, reject) => {
          if (user) {
            const validPassword = user.validatePassword(user.password);
            if (!validPassword) {
              return new Error("Email or password not valid");
            }
            resolve("IsValid");
          }
          reject("Email or password not valid");
        });
      })
      .catch((e) => {
        console.error(`Error to get user ${email}`, e);
      });
  };

  public clear = () => {
    User.deleteMany({ name: "fess00666" }).then((e) => console.log(e));
  };

  public register = async (payload: Types.UserPayload) => {
    const newUser = new User();
    try {
      newUser.name = payload.name;
      newUser.email = payload.email;
      newUser.password = payload.password;
      newUser.setPassword(payload.password);
      try {
        newUser.save();
        console.warn("User was added");
      } catch (e) {
        console.error("Error to add new user");
      }
    } catch (e) {
      console.error("Error to add user", e);
    }
  };
}

export default DataBase;
