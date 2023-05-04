declare namespace Types {
  export type UserPayload = {
    name: string;
    email: string;
    password: string;
  };
  type IUser = {
    name: string;
    email: string;
    password: string;
    setPassword: (password: string) => void;
    validatePassword: (password: string) => boolean;
    hash: string;
    salt: string;
    token: string;
  };
}

export default Types;
