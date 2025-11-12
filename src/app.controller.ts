import type { Express, Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { MoodEnum } from "./utils/constants/enum.constants.ts";
import globalErrorHandler from "./utils/handlers/global.error.handler.ts";
import connectDB from "./db/db.connection.ts";
import { UserModel } from "./db/models/user.model.ts";
import modulesRouter from "./modules/module.routes.ts";
import uploadsRouter from "./uploads/uploads.route.ts";
import protocolAndHostHanlder from "./utils/handlers/protocol_host.handler.ts";
import { Server, Socket } from "socket.io";
import Token from "./utils/security/token.security.ts";

const connectedSockets = new Map<string, string>();

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
    app.use(protocolAndHostHanlder);
    app.use(express.json());
    app.use(["/", "/api/v1"], modulesRouter);
    app.use("/uploads", uploadsRouter);

    app.use("{/*dummy}", (req: Request, res: Response) => {
      res.status(404).json({
        error: `Wrong ROUTE ${req.baseUrl} or METHOD ${req.method} 😵`,
      });
    });
  }
  app.use(globalErrorHandler);

  const httpServer = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} 🚀`);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
  io.use(async (socket: Socket, next) => {
    try {
      const { user } = await Token.decode({
        authorization: socket.handshake.auth.authorization,
      });
      connectedSockets.set(user._id.toString(), socket.id);
      next();
    } catch (error: any) {
      next(error);
    }
  });

  // http://localhost:3001/
  io.on("connection", (socket: Socket) => {
    socket.emit("connection_id", socket.id);

    console.log("Public Channel:: ", { socketId: socket.id });
    console.log({ connectedSockets });

    // socket.on("sayHi", (data, callback) => {
    //   console.log({ data });
    //   callback("Welcome front-end");
    // });

    socket.emit("productStock", {
      productId: "2319827391",
      quantity: 10,
    });

    socket.on("disconnect", () => {
      console.log(`Logout from :: ${socket.id}`);
    });
  });

  // http://localhost:3001/admin
  // io.of("admin").on("connection", (socket: Socket) => {
  //   console.log("Admin Channel:: ",{ socketId: socket.id });

  //   socket.on("disconnect", () => {
  //     console.log(`Logout from :: ${socket.id}`);
  //   });
  // });
}

export default bootstrap;
