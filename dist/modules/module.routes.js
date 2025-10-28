import { Router } from "express";
import authRouter from "./auth/auth.controller.js";
import userRouter from "./user/user.controller.js";
const modulesRouter = Router();
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
export default modulesRouter;
