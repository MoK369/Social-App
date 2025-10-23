import { Router } from "express";
import authenticationService from "./auth.service.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import AuthValidation from "./auth.validation.js";
const authRouter = Router();
authRouter.post("/signup", validationMiddleware(AuthValidation.signup), authenticationService.signup);
authRouter.patch("/confirm-email", validationMiddleware(AuthValidation.confirmEmail), authenticationService.confirmEmail);
authRouter.post("/login", validationMiddleware(AuthValidation.login), authenticationService.login);
export default authRouter;
