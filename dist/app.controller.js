import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRouter from "./modules/auth/auth.controller.js";
import morgan from "morgan";
import { MoodEnum } from "./utils/constants/enum.constants.js";
function bootstrap() {
    const app = express();
    app.use(cors());
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        message: { error: "Too many requests, please try again later." },
    }));
    app.use(morgan(process.env.MOOD === MoodEnum.DEVELOPMENT ? "dev" : "combined"));
    app.use(express.json());
    app.get("/", (req, res) => {
        res.json({
            message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
        });
    });
    app.use("/auth", authRouter);
    app.use("{/*dummy}", (req, res) => {
        res.status(404).json({ error: `Wrong ROUTE ${req.baseUrl} or METHOD ${req.method} 😵` });
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT} 🚀`);
    });
}
export default bootstrap;
