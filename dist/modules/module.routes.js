import { Router } from "express";
import { authRouter } from "./auth/index.js";
import { userRouter } from "./user/index.js";
import { postRouter } from "./post/index.js";
const modulesRouter = Router();
modulesRouter.get("/", (req, res) => {
    res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
    });
});
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
modulesRouter.use("/post", postRouter);
export default modulesRouter;
