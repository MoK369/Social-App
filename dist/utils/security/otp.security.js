import { customAlphabet } from "nanoid";
export const generateNumaricOTP = () => {
    return customAlphabet("0123456789", 6)();
};
