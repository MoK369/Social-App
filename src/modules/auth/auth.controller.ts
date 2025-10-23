import { Router } from "express";
import authenticationService from "./auth.service.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import AuthValidation from "./auth.validation.ts";
import authenticationMiddleware from "../../middlewares/authentication.middleware.ts";

const authRouter: Router = Router();

authRouter.post(
  "/signup",
  validationMiddleware(AuthValidation.signup),
  authenticationService.signup
);

authRouter.patch(
  "/confirm-email",
  validationMiddleware(AuthValidation.confirmEmail),
  authenticationService.confirmEmail
);
authRouter.post(
  "/login",
  validationMiddleware(AuthValidation.login),
  authenticationService.login
);

export default authRouter;
