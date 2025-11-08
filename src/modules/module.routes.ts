import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth/auth.controller.ts";
import userRouter from "./user/user.controller.ts";
import S3Service from "../utils/multer/s3.service.ts";
import { BadRequestException } from "../utils/exceptions/custom.exceptions.ts";
import asyncPipeline from "../utils/stream/async_pipeline.stream.ts";

const modulesRouter = Router();

modulesRouter.get("/", (req: Request, res: Response) => {
  res.json({
    message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
  });
});

type GetFileQueryParamsType = {
  download?: string;
  downloadName?: string;
};
modulesRouter.get(
  "uploads/*path",
  async (req: Request, res: Response): Promise<void> => {
    const { download, downloadName }: GetFileQueryParamsType =
      req.query as unknown as GetFileQueryParamsType;
    const { path } = req.params as unknown as { path: string[] };
    const key = path.join("/");

    const s3Response = await S3Service.getFile({ Key: key });
    if (!s3Response.Body) {
      throw new BadRequestException("Failed to fetch this asset ☹️");
    }
    console.log({
      s3Response: s3Response,
      typeof: typeof s3Response.Body,
    });

    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream"
    );
    if (download === "true") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${
          downloadName
            ? `${downloadName}.${s3Response.ContentType?.split("/")[1]}`
            : key.split("/").pop()
        }"`
      );
    }
    return asyncPipeline({
      source: s3Response.Body as NodeJS.ReadableStream,
      destination: res,
    });
  }
);

modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);

export default modulesRouter;
