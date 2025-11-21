import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import Token from "../../utils/security/token.security.js";
import ChatGateway from "../chat/chat.gateway.js";
export const connectedSockets = new Map();
export let io;
export const initializeIo = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    io.use(async (socket, next) => {
        try {
            const { user, payload } = await Token.decode({
                authorization: socket.handshake.auth.authorization,
            });
            const userTabs = connectedSockets.get(user._id.toString());
            if (!userTabs) {
                connectedSockets.set(user._id.toString(), [socket.id]);
            }
            else {
                userTabs.push(socket.id.toString());
            }
            socket.credentials = {
                user,
                payload,
            };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    const chatGateway = new ChatGateway();
    io.on("connection", (socket) => {
        socket.emit("connection_id", socket.id);
        console.log("After connection:: ", connectedSockets);
        chatGateway.register(socket, io);
        onDisconnection(socket);
    });
    function onDisconnection(socket) {
        const userId = socket.credentials.user._id.toString();
        socket.on("disconnect", () => {
            const userTabs = connectedSockets.get(userId)?.filter((id) => socket.id != id) || [];
            if (userTabs.length == 0) {
                connectedSockets.delete(userId);
                io.emit("offline_user", `user ${userId} has disconnected`);
            }
            else {
                connectedSockets.set(userId, userTabs);
            }
            console.log(`after logout:: `, connectedSockets);
        });
    }
};
