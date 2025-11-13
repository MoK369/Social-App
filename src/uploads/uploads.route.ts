import { Router } from "express";
import type { Request, Response } from "express";
import S3Service from "../utils/multer/s3.service.ts";
import { BadRequestException } from "../utils/exceptions/custom.exceptions.ts";
import asyncPipeline from "../utils/stream/async_pipeline.stream.ts";
import successHandler from "../utils/handlers/success.handler.ts";

const uploadsRouter = Router();

type GetFileQueryParamsType = {
  download?: string;
  downloadName?: string;
};
uploadsRouter.get(
  "/presignd-url/*path",
  async (req: Request, res: Response): Promise<Response> => {
    const { download, downloadName }: GetFileQueryParamsType =
      req.query as unknown as GetFileQueryParamsType;
    const { path } = req.params as unknown as { path: string[] };
    const SubKey = path.join("/");

    const signedUrl = await S3Service.createPresignedGetUrl({
      SubKey,
      download,
      downloadName,
    });

    return successHandler({
      res,
      message: "Presigned URL Generated !",
      body: { url: signedUrl },
    });
  }
);
uploadsRouter.get(
  "/*path",
  async (req: Request, res: Response): Promise<void> => {
    const { download, downloadName }: GetFileQueryParamsType =
      req.query as unknown as GetFileQueryParamsType;
    const { path } = req.params as unknown as { path: string[] };
    const SubKey = path.join("/");

    const s3Response = await S3Service.getFile({ SubKey });
    if (!s3Response.Body) {
      throw new BadRequestException("Failed to fetch this asset ☹️");
    }

    res.set("Cross-Origin-Resource-Policy", "cross-origin");
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
            : SubKey.split("/").pop()
        }"`
      );
    }
    return asyncPipeline({
      source: s3Response.Body as NodeJS.ReadableStream,
      destination: res,
    });
  }
);

export default uploadsRouter;
