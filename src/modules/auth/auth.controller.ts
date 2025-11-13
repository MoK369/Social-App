import { Router } from "express";
import authenticationService from "./auth.service.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import AuthValidators from "./auth.validation.ts";

const authRouter: Router = Router();

authRouter.post(
  "/signup",
  validationMiddleware(AuthValidators.signup),
  authenticationService.signup
);

authRouter.post(
  "/login",
  validationMiddleware(AuthValidators.login),
  authenticationService.login
);

authRouter.post(
  "/login-2fa-otp",
  validationMiddleware(AuthValidators.loginTwoFactor),
  authenticationService.loginTwoFactor
);

authRouter.patch(
  "/confirm-email",
  validationMiddleware(AuthValidators.confirmEmail),
  authenticationService.confirmEmail
);

authRouter.patch(
  "/resend-email-otp",
  validationMiddleware(AuthValidators.resendEmilOtp),
  authenticationService.resendEmilOtp
);

authRouter.patch(
  "/send-forget-password-otp",
  validationMiddleware(AuthValidators.sendForgetPasswordOtp),
  authenticationService.sendForgetPasswordOtp
);

authRouter.patch(
  "/verify-forget-password-otp",
  validationMiddleware(AuthValidators.verifyForgetPasswordOtp),
  authenticationService.verifyForgetPasswordOtp
);

authRouter.patch(
  "/reset-forgot-password",
  validationMiddleware(AuthValidators.resetForgotPassword),
  authenticationService.resetForgotPassword
);

export default authRouter;
