import { Router } from "express";
import authRouter from "./auth/auth.controller.js";
import userRouter from "./user/user.controller.js";
const modulesRouter = Router();
modulesRouter.get("/", (req, res) => {
    res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
    });
});
modulesRouter.use("/auth", authRouter);
modulesRouter.use("/user", userRouter);
export default modulesRouter;
