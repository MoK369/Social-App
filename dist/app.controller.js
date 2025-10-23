import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { MoodEnum } from "./utils/constants/enum.constants.js";
import globalErrorHandler from "./utils/handlers/global.error.handler.js";
import connectDB from "./db/db.connection.js";
import UserModel from "./db/models/user.model.js";
import modulesRouter from "./modules/module.routes.js";
async function bootstrap() {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { error: "Too many requests, please try again later." },
    }));
    app.use(morgan(process.env.MOOD === MoodEnum.DEVELOPMENT ? "dev" : "combined"));
    const result = await connectDB();
    if (!result) {
        app.use("{/*dummy}", (req, res) => {
            res.status(500).json({
                error: `Something went wrong please try again later 😵`,
            });
        });
    }
    else {
        await UserModel.syncIndexes();
        app.use(express.json());
        app.get("/", (req, res) => {
            res.json({
                message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
            });
        });
        app.use("/api/v1", modulesRouter);
        app.use("{/*dummy}", (req, res) => {
            res.status(404).json({
                error: `Wrong ROUTE ${req.baseUrl} or METHOD ${req.method} 😵`,
            });
        });
    }
    app.use(globalErrorHandler);
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT} 🚀`);
    });
}
export default bootstrap;
