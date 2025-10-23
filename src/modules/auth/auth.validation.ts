import { z } from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.ts";
import { GenderEnum } from "../../utils/constants/enum.constants.ts";

const login = {
  body: z.strictObject({
    email: z.email(),
    password: generalValidationFields.password,
  }),
};

const signup = {
  body: login.body
    .extend({
      fullName: z.string().min(3).max(30),
      phone: generalValidationFields.phone,
      gender: z.enum(
        Object.values(GenderEnum),
        `Invalid gender. Expected values are ${Object.values(GenderEnum)}`
      ),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      generalValidationFields.confirmPasswordChecker(data, ctx);
    }),
};

const confirmEmail = {
  body: z.strictObject({
    email: z.email(),
    otp: generalValidationFields.otp,
  }),
};

const authValidators = {
  login,
  signup,
  confirmEmail,
};

export default authValidators;
