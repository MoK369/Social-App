import type { HydratedDocument, Types } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updateAt?: Date;
}
export type HIMessage = HydratedDocument<IMessage>;

export interface IChat {
  // OVO (One-Versus-One)
  participants: Types.ObjectId[];
  messages: IMessage[];

  // OVM (One-Versus-Many)
  groupName?: string;
  groupImage?: string;
  roomId?: string;

  createdBy: Types.ObjectId;
  createdAt?: Date;
  updateAt?: Date;
}

export type HIChat = HydratedDocument<IChat>;
