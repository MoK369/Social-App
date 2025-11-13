import { hash, compare } from "bcrypt";
class Hashing {
    static generateHash = ({ plainText, saltNumber = Number(process.env.SALT_NUMBER), }) => {
        return hash(plainText, saltNumber);
    };
    static compareHash = ({ plainText, cipherText, }) => {
        return compare(plainText, cipherText);
    };
    static isHashed = ({ text }) => {
        return (typeof text === "string" &&
            text.length === 60 &&
            (text.startsWith("$2a$") ||
                text.startsWith("$2b$") ||
                text.startsWith("$2y$")));
    };
}
export default Hashing;
