import { Router } from "express";
import { authRouter } from "./auth/index.js";
import { userRouter } from "./user/index.js";
import { postRouter } from "./post/index.js";
import { chatRouter } from "./chat/index.js";
import { commentRouter } from "./comment/index.js";
const modulesRouter = Router();
modulesRouter.get("/", (req, res) => {
    res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
    });
});
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
modulesRouter.use("/post", postRouter);
modulesRouter.use("/chat", chatRouter);
modulesRouter.use("/comment", commentRouter);
export default modulesRouter;
