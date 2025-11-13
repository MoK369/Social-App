import DatabaseRepository from "./database.repository.ts";
import type { IChat as TDocument } from "../interfaces/chat.interface.ts";
import type { Model } from "mongoose";

class ChatRespository extends DatabaseRepository<TDocument> {
  constructor(chatModel: Model<TDocument>) {
    super(chatModel);
  }
}

export default ChatRespository;
