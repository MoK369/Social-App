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
}
export default ChatEvents;
