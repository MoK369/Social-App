import type { HIChat } from "../../db/interfaces/chat.interface.ts";
import type { IPaginationMetaData } from "../../utils/constants/interface.constants.ts";

export interface IGetChatResponse {
  chat: Partial<HIChat & IPaginationMetaData>;
}

export interface ICreateChatGroupResponse {
  chattingGroup: HIChat;
}
