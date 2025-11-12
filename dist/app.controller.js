import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { MoodEnum } from "./utils/constants/enum.constants.js";
import globalErrorHandler from "./utils/handlers/global.error.handler.js";
import connectDB from "./db/db.connection.js";
import { UserModel } from "./db/models/user.model.js";
import modulesRouter from "./modules/module.routes.js";
import uploadsRouter from "./uploads/uploads.route.js";
import protocolAndHostHanlder from "./utils/handlers/protocol_host.handler.js";
import { Server, Socket } from "socket.io";
import Token from "./utils/security/token.security.js";
const connectedSockets = new Map();
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
        app.use(protocolAndHostHanlder);
        app.use(express.json());
        app.use(["/", "/api/v1"], modulesRouter);
        app.use("/uploads", uploadsRouter);
        app.use("{/*dummy}", (req, res) => {
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
    io.use(async (socket, next) => {
        try {
            const { user } = await Token.decode({
                authorization: socket.handshake.auth.authorization,
            });
            connectedSockets.set(user._id.toString(), socket.id);
            next();
        }
        catch (error) {
            next(error);
        }
    });
    io.on("connection", (socket) => {
        socket.emit("connection_id", socket.id);
        console.log("Public Channel:: ", { socketId: socket.id });
        console.log({ connectedSockets });
        socket.emit("productStock", {
            productId: "2319827391",
            quantity: 10,
        });
        socket.on("disconnect", () => {
            console.log(`Logout from :: ${socket.id}`);
        });
    });
}
export default bootstrap;
