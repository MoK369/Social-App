import { Router } from "express";
import authRouter from "./auth/auth.controller.ts";
import userRouter from "./user/user.controller.ts";

const modulesRouter = Router();

modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user",userRouter)

export default modulesRouter;
