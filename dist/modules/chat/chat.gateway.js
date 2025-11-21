import ChatEvents from "./chat.events.js";
class ChatGateway {
    chatEvents = new ChatEvents();
    register = (socket, io) => {
        this.chatEvents.sayHi(socket, io);
        this.chatEvents.sendMessage(socket, io);
        this.chatEvents.joinRoom(socket, io);
        this.chatEvents.sendGroupMessage(socket, io);
    };
}
export default ChatGateway;
