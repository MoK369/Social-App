import { z } from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.ts";
import { GenderEnum } from "../../utils/constants/enum.constants.ts";

class AuthValidators {
  static login = {
    body: z.strictObject({
      email: z.email(),
      password: generalValidationFields.password,
    }),
  };

  static signup = {
    body: this.login.body
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

  static confirmEmail = {
    body: z.strictObject({
      email: z.email(),
      otp: generalValidationFields.otp,
    }),
  };
}

export default AuthValidators;
