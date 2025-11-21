import { Server as IOServer } from "socket.io";
import ChatService from "./chat.service.js";
class ChatEvents {
    chatService = new ChatService();
    sayHi = (socket, io) => {
        socket.on("sayHi", (message, callback) => {
            this.chatService.sayHi({ message, socket, io, callback });
        });
    };
    sendMessage = (socket, io) => {
        socket.on("sendMessage", (data) => {
            this.chatService.sendMessage({ ...data, socket, io });
        });
    };
    joinRoom = (socket, io) => {
        socket.on("join_room", (data) => {
            this.chatService.joinRoom({ ...data, socket, io });
        });
    };
    sendGroupMessage = (socket, io) => {
        socket.on("sendGroupMessage", (data) => {
            this.chatService.sendGroupMessage({ ...data, socket, io });
        });
    };
}
export default ChatEvents;
