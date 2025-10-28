import { Router } from "express";
import userService from "./user.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
const userRouter = Router();
userRouter.get('/', Auths.authenticationMiddleware(), userService.profile);
export default userRouter;
