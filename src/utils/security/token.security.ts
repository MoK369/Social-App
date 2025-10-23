import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

class Token {
  static generate = ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: object;
    secret?: Secret;
    options?: SignOptions;
  }): string => {
    return jwt.sign(payload, secret, options);
  };
}

export default Token;
