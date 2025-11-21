import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { IAuthSocket } from "../../utils/constants/interface.constants.ts";
import Token from "../../utils/security/token.security.ts";
import ChatGateway from "../chat/chat.gateway.ts";

export const connectedSockets = new Map<string, string[]>();

export let io!: Server;

export const initializeIo = (httpServer: HttpServer): void => {
  // Start IO server
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Middlwares
  // listen =>  http://localhost:3001/
  // Authentication (Handshake)
  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, payload } = await Token.decode({
        authorization: socket.handshake.auth.authorization,
      });
      const userTabs = connectedSockets.get(user._id.toString());
      if (!userTabs) {
        connectedSockets.set(user._id.toString(), [socket.id]);
      } else {
        userTabs.push(socket.id.toString());
      }
      socket.credentials = {
        user,
        payload,
      };
      next();
    } catch (error: any) {
      next(error);
    }
  });

  // Listen on Connection
  // listen =>  http://localhost:3001/
  const chatGateway = new ChatGateway();
  io.on("connection", (socket: IAuthSocket) => {
    socket.emit("connection_id", socket.id);
    //console.log("After connection:: ", connectedSockets);

    chatGateway.register(socket, io);

    onDisconnection(socket);
  });

  // Listen on Disconnection
  function onDisconnection(socket: IAuthSocket): void {
    const userId = socket.credentials!.user._id!.toString();

    socket.on("disconnect", () => {
      const userTabs =
        connectedSockets.get(userId)?.filter((id) => socket.id != id) || [];
      if (userTabs.length == 0) {
        connectedSockets.delete(userId);
        io.emit("offline_user", `user ${userId} has disconnected`);
      } else {
        connectedSockets.set(userId, userTabs);
      }

      //console.log(`after logout:: `, connectedSockets);
    });
  }

  // http://localhost:3001/admin
  // io.of("/admin").on("connection", (socket: Socket) => {
  //   console.log("Admin Channel:: ",{ socketId: socket.id });

  //   socket.on("disconnect", () => {
  //     console.log(`Logout from :: ${socket.id}`);
  //   });
  // });
};
