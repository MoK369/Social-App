import { Router } from "express";
import userService from "./user.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import UserValidators from "./user.validation.js";
const userRouter = Router();
userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.post("/logout", Auths.authenticationMiddleware(), validationMiddleware(UserValidators.logout), userService.logout);
export default userRouter;
