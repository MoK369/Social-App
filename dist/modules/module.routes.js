import { Router } from "express";
import authRouter from "./auth/auth.controller.js";
import userRouter from "./user/user.controller.js";
import successHandler from "../utils/handlers/success.handler.js";
import S3Service from "../utils/multer/s3.service.js";
const modulesRouter = Router();
modulesRouter.get("/", (req, res) => {
    res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
    });
});
modulesRouter.get("/*path", async (req, res) => {
    const { path } = req.params;
    const key = path.join("/");
    const s3Response = await S3Service.getFile({ Key: key });
    console.log({ s3Response: s3Response.Body });
    return successHandler({ res, body: { key } });
});
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
export default modulesRouter;
