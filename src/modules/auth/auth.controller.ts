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

authRouter.patch(
  "/confirm-email",
  validationMiddleware(AuthValidators.confirmEmail),
  authenticationService.confirmEmail
);
authRouter.post(
  "/login",
  validationMiddleware(AuthValidators.login),
  authenticationService.login
);

export default authRouter;
