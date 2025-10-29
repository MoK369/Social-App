import { Router } from "express";
import authenticationService from "./auth.service.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import AuthValidators from "./auth.validation.js";
const authRouter = Router();
authRouter.post("/signup", validationMiddleware(AuthValidators.signup), authenticationService.signup);
authRouter.patch("/confirm-email", validationMiddleware(AuthValidators.confirmEmail), authenticationService.confirmEmail);
authRouter.post("/login", validationMiddleware(AuthValidators.login), authenticationService.login);
export default authRouter;
