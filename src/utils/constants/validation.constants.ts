import { z } from "zod";

const generalValidationFields = {
  phone: z.string().regex(/^(002|\+2)?01[0125][0-9]{8}$/),
  password: z
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  confirmPasswordChecker: (
    data: { confirmPassword: string; password: String } & Record<string, any>,
    ctx: z.core.$RefinementCtx
  ) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "confirmPassword mismatch password",
      });
    }
  },
  otp: z
    .string()
    .regex(/^\d{6}$/, { error: "OTP must consists only of 6 digits" }),
};

export default generalValidationFields;
