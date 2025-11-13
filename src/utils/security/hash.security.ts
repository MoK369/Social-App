import { hash, compare } from "bcrypt";

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

  static isHashed = ({ text }: { text: string }) => {
    return (
      typeof text === "string" &&
      text.length === 60 &&
      (text.startsWith("$2a$") ||
        text.startsWith("$2b$") ||
        text.startsWith("$2y$"))
    );
  };
}

export default Hashing;
