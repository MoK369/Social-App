import { customAlphabet, nanoid } from "nanoid";

export const generateNumericId = ({ size = 6 }: { size?: number }={}): string => {
  return customAlphabet("0123456789", size)();
};

export const generateAlphaNumaricId = ({
  size = 21,
}: { size?: number } = {}): string => {
  return nanoid(size);
};
