import { Router } from "express";
import userService from "./user.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";

const userRouter = Router();

userRouter.get('/',Auths.authenticationMiddleware(),userService.profile)

export default userRouter;