import { Router } from "express";
import authRouter from "./auth/auth.controller.js";
const modulesRouter = Router();
modulesRouter.use("/auth", authRouter);
export default modulesRouter;
