import { Router } from "express";
import S3Service from "../utils/multer/s3.service.js";
import { BadRequestException } from "../utils/exceptions/custom.exceptions.js";
import asyncPipeline from "../utils/stream/async_pipeline.stream.js";
import successHandler from "../utils/handlers/success.handler.js";
const uploadsRouter = Router();
uploadsRouter.get("/presignd-url/*path", async (req, res) => {
    const { download, downloadName } = req.query;
    const { path } = req.params;
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
});
uploadsRouter.get("/*path", async (req, res) => {
    const { download, downloadName } = req.query;
    const { path } = req.params;
    const SubKey = path.join("/");
    const s3Response = await S3Service.getFile({ SubKey });
    if (!s3Response.Body) {
        throw new BadRequestException("Failed to fetch this asset ☹️");
    }
    res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
    if (download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${downloadName
            ? `${downloadName}.${s3Response.ContentType?.split("/")[1]}`
            : SubKey.split("/").pop()}"`);
    }
    return asyncPipeline({
        source: s3Response.Body,
        destination: res,
    });
});
export default uploadsRouter;
