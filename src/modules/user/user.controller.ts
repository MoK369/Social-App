import { Router } from "express";
import userService from "./user.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import UserValidators from "./user.validation.ts";
import { TokenTypesEnum } from "../../utils/constants/enum.constants.ts";

const userRouter = Router();

userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.post(
  "/logout",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.logout),
  userService.logout
);

userRouter.post(
  "/refresh-token",
  Auths.authenticationMiddleware({ tokenType: TokenTypesEnum.refresh }),
  userService.refreshToken
);


export default userRouter;
