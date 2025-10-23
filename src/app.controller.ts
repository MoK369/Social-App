import type { Express, Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { MoodEnum } from "./utils/constants/enum.constants.ts";
import globalErrorHandler from "./utils/handlers/global.error.handler.ts";
import connectDB from "./db/db.connection.ts";
import UserModel from "./db/models/user.model.ts";
import modulesRouter from "./modules/module.routes.ts";

async function bootstrap(): Promise<void> {
  const app: Express = express();

  app.use(cors());
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // limit each IP to 200 requests per windowMs
      message: { error: "Too many requests, please try again later." },
    })
  );
  app.use(
    morgan(process.env.MOOD === MoodEnum.DEVELOPMENT ? "dev" : "combined")
  );

  // connect to database
  const result = await connectDB();
  if (!result) {
    app.use("{/*dummy}", (req: Request, res: Response) => {
      res.status(500).json({
        error: `Something went wrong please try again later 😵`,
      });
    });
  } else {
    await UserModel.syncIndexes();
    app.use(express.json());
    app.get("/", (req: Request, res: Response) => {
      res.json({
        message: `Welcome to ${process.env.APP_NAME} Backend Landing Page ❤️`,
      });
    });

    app.use("/api/v1", modulesRouter);

    app.use("{/*dummy}", (req: Request, res: Response) => {
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
