import { z } from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.ts";

const login = {
  body: z.strictObject({
    email: z.email(),
    password: generalValidationFields.password,
  }),
};

const signup = {
  body: login.body
    .extend({
      username: z.string().min(3).max(30),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      generalValidationFields.confirmPasswordChecker(data, ctx);
    }),
};

const authValidators = {
  login,
  signup,
};

export default authValidators;
