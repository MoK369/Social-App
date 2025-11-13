import type { IAuthSocket } from "../../utils/constants/interface.constants.ts";
import { Server as IOServer } from "socket.io";
import ChatService from "./chat.service.ts";

class ChatEvents {
  private chatService = new ChatService();

  sayHi = (socket: IAuthSocket, io: IOServer): void => {
    socket.on("sayHi", (message, callback) => {
      this.chatService.sayHi({ message, socket, io, callback });
    });
  };

  sendMessage = (socket: IAuthSocket, io: IOServer): void => {
    socket.on("sendMessage", (data: { content: string; sendTo: string }) => {
      this.chatService.sendMessage({ ...data, socket, io });
    });
  };
}

export default ChatEvents;
