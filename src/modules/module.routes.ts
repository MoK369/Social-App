import { Router } from "express";
import type { Request, Response } from "express";
import { authRouter } from "./auth/index.ts";
import { userRouter } from "./user/index.ts";
import { postRouter } from "./post/index.ts";

const modulesRouter = Router();

modulesRouter.get("/", (req: Request, res: Response) => {
  res.json({
    message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
  });
});

modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
modulesRouter.use("/post", postRouter);

export default modulesRouter;
