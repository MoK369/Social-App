import {hash,compare} from "bcrypt";

class Hashing {
  static generateHash = ({
    plainText,
    saltNumber = Number(process.env.SALT_NUMBER),
  }: {
    plainText: string;
    saltNumber?: number;
  }): Promise<string> => {
    return hash(plainText, saltNumber);
  };

  static compareHash = ({
    plainText,
    cipherText,
  }: {
    plainText: string;
    cipherText: string;
  }): Promise<boolean> => {
    return compare(plainText, cipherText);
  };
}

export default Hashing;
