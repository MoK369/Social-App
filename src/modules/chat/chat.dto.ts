import type z from "zod";
import type { IAuthSocket } from "../../utils/constants/interface.constants.ts";
import type { Server as IOServer } from "socket.io";
import type ChatValidators from "./chat.validation.ts";

// REST
export type GetChatParamsDtoType = z.infer<
  typeof ChatValidators.getChat.params
>;

export type GetChatQueryDtoType = z.infer<typeof ChatValidators.getChat.query>;

export type GetChatGroupParamsDtoType = z.infer<
  typeof ChatValidators.getChatGroup.params
>;

export type GetChatGroupQueryDtoType = z.infer<
  typeof ChatValidators.getChatGroup.query
>;

export type CreateChatGroupBodyDtoType = z.infer<
  typeof ChatValidators.createChatGroup.body
>;

// IO
export interface IMainDto {
  socket: IAuthSocket;
  io: IOServer;
  callback?: (arg: any) => any;
}

export interface ISayHiDto extends IMainDto {
  message: string;
}

export interface ISendMessageDto extends IMainDto {
  content: string;
  sendTo: string;
}

export interface IJoinRoomDto extends IMainDto {
  roomId: string;
}

export interface ISendGroupMessageDto extends IMainDto {
  content: string;
  groupId: string;
}
