import { Router } from "express";
import authRouter from "./auth/auth.controller.js";
import userRouter from "./user/user.controller.js";
import S3Service from "../utils/multer/s3.service.js";
import { BadRequestException } from "../utils/exceptions/custom.exceptions.js";
import asyncPipeline from "../utils/stream/async_pipeline.stream.js";
const modulesRouter = Router();
modulesRouter.get("/", (req, res) => {
    res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
    });
});
modulesRouter.get("uploads/*path", async (req, res) => {
    const { download, downloadName } = req.query;
    const { path } = req.params;
    const key = path.join("/");
    const s3Response = await S3Service.getFile({ Key: key });
    if (!s3Response.Body) {
        throw new BadRequestException("Failed to fetch this asset ☹️");
    }
    console.log({
        s3Response: s3Response,
        typeof: typeof s3Response.Body,
    });
    res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
    if (download === "true") {
        res.setHeader("Content-Disposition", `attachment; filename="${downloadName
            ? `${downloadName}.${s3Response.ContentType?.split("/")[1]}`
            : key.split("/").pop()}"`);
    }
    return asyncPipeline({
        source: s3Response.Body,
        destination: res,
    });
});
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
export default modulesRouter;
