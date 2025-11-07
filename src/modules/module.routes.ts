import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth/auth.controller.ts";
import userRouter from "./user/user.controller.ts";
import successHandler from "../utils/handlers/success.handler.ts";
import S3Service from "../utils/multer/s3.service.ts";

const modulesRouter = Router();

modulesRouter.get("/", (req: Request, res: Response) => {
  res.json({
    message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
  });
});

modulesRouter.get("/*path", async (req: Request, res: Response) => {
  const { path } = req.params as unknown as { path: string[] };
  const key = path.join("/");

  const s3Response = await S3Service.getFile({ Key: key });
  console.log({ s3Response: s3Response.Body });

  return successHandler({ res, body: { key } });
});

modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);

export default modulesRouter;
