import { z } from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.js";
import { GenderEnum } from "../../utils/constants/enum.constants.js";
class AuthValidators {
    static login = {
        body: z.strictObject({
            email: z.email(),
            password: generalValidationFields.password,
        }),
    };
    static loginTwoFactor = {
        body: z.strictObject({
            email: z.email(),
            otp: generalValidationFields.otp,
        }),
    };
    static signup = {
        body: this.login.body
            .extend({
            fullName: z.string().min(3).max(30),
            phone: generalValidationFields.phone,
            gender: z.enum(Object.values(GenderEnum), `Invalid gender. Expected values are ${Object.values(GenderEnum)}`),
            confirmPassword: z.string(),
        })
            .superRefine((data, ctx) => {
            generalValidationFields.confirmPasswordChecker(data, ctx);
        }),
    };
    static resendEmilOtp = {
        body: z.strictObject({
            email: z.email(),
        }, { error: "Missing body paramters" }),
    };
    static confirmEmail = {
        body: this.resendEmilOtp.body.extend({
            otp: generalValidationFields.otp,
        }),
    };
    static sendForgetPasswordOtp = {
        body: this.resendEmilOtp.body.extend({}),
    };
    static verifyForgetPasswordOtp = {
        body: this.confirmEmail.body.extend({}),
    };
    static resetForgotPassword = {
        body: this.resendEmilOtp.body
            .extend({
            password: generalValidationFields.password,
            confirmPassword: z.string(),
        })
            .superRefine((data, ctx) => {
            generalValidationFields.confirmPasswordChecker(data, ctx);
        }),
    };
}
export default AuthValidators;
