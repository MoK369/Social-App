import { customAlphabet, nanoid } from "nanoid";
export const generateNumaricOTP = () => {
    return customAlphabet("0123456789", 6)();
};
export const generate21CharactersId = ({ size = 21, } = {}) => {
    return nanoid(size);
};
