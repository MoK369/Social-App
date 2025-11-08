import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth/auth.controller.ts";
import userRouter from "./user/user.controller.ts";


const modulesRouter = Router();

modulesRouter.get("/", (req: Request, res: Response) => {
  res.json({
    message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
  });
});

modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);

export default modulesRouter;
