import type { Server as IOServer } from "socket.io";
import type { IAuthSocket } from "../../utils/constants/interface.constants.ts";
import ChatEvents from "./chat.events.ts";

class ChatGateway {
  protected chatEvents = new ChatEvents();

  register = (socket: IAuthSocket, io: IOServer): void => {
    this.chatEvents.sayHi(socket, io);
    this.chatEvents.sendMessage(socket, io);
    this.chatEvents.joinRoom(socket, io);
    this.chatEvents.sendGroupMessage(socket, io);
  };
}

export default ChatGateway;
