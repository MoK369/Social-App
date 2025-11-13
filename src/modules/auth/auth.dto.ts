import { z } from "zod";
import authValidators from "./auth.validation.ts";

export type SignupBodyDtoType = z.infer<typeof authValidators.signup.body>;

export type ConfirmEmailBodyDtoType = z.infer<
  typeof authValidators.confirmEmail.body
>;

export type LoginBodyDtoType = z.infer<typeof authValidators.login.body>;
export type ResendEmailOtpBodyDtoType = z.infer<
  typeof authValidators.resendEmilOtp.body
>;
export type SendForgetPasswordOtpBodyDtoType = z.infer<
  typeof authValidators.sendForgetPasswordOtp.body
>;

export type VerifyForgetPasswordOtpBodyDtoType = z.infer<
  typeof authValidators.verifyForgetPasswordOtp.body
>;

export type ResetForgotPasswordBodyDtoType = z.infer<
  typeof authValidators.resetForgotPassword.body
>;

export type LoginTwoFactorBodyDtoType = z.infer<
  typeof authValidators.loginTwoFactor.body
>;
