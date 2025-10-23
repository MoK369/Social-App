import { customAlphabet } from "nanoid";

export const generateNumaricOTP = (): string => {
  return customAlphabet("0123456789", 6)();
};
