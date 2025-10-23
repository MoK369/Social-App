import { hash, compare } from "bcrypt";
class Hashing {
    static generateHash = ({ plainText, saltNumber = Number(process.env.SALT_NUMBER), }) => {
        return hash(plainText, saltNumber);
    };
    static compareHash = ({ plainText, cipherText, }) => {
        return compare(plainText, cipherText);
    };
}
export default Hashing;
