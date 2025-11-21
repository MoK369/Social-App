import type { Default__v, HydratedDocument, Require_id, Types } from "mongoose";

export interface IMessage {
  id?: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updateAt?: Date;
}
export type HIMessage = HydratedDocument<IMessage>;
export type FullIMessage = Require_id<Default__v<IMessage>>;

export interface IChat {
  // OVO (One-Versus-One)
  participants: Types.ObjectId[];
  messages: IMessage[];

  // OVM (One-Versus-Many)
  groupName?: string;
  groupImage?: string | undefined;
  roomId?: string;

  createdBy: Types.ObjectId;
  createdAt?: Date;
  updateAt?: Date;
}

export type FullIChat = Require_id<Default__v<IChat>>;

export type HIChat = HydratedDocument<IChat>;
