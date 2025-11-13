import ChatEvents from "./chat.events.js";
class ChatGateway {
    chatEvents = new ChatEvents();
    register = (socket, io) => {
        this.chatEvents.sayHi(socket, io);
        this.chatEvents.sendMessage(socket, io);
    };
}
export default ChatGateway;
