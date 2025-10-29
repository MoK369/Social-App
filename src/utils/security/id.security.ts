import { customAlphabet, nanoid } from "nanoid";

export const generateNumaricOTP = (): string => {
  return customAlphabet("0123456789", 6)();
};

export const generate21CharactersId = ({
  size = 21,
}: { size?: number } = {}): string => {
  return nanoid(size);
};
