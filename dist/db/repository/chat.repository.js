import DatabaseRepository from "./database.repository.js";
class ChatRespository extends DatabaseRepository {
    constructor(chatModel) {
        super(chatModel);
    }
}
export default ChatRespository;
