import { customAlphabet, nanoid } from "nanoid";
export const generateNumericId = ({ size = 6 } = {}) => {
    return customAlphabet("0123456789", size)();
};
export const generateAlphaNumaricId = ({ size = 21, } = {}) => {
    return nanoid(size);
};
