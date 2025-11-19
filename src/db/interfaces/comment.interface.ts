import type { HydratedDocument, Types } from "mongoose";
import type { IAtByObject } from "./common.interface.ts";
import type { IPost } from "./post.interface.ts";

export interface IComment {
  postId: Types.ObjectId | Partial<IPost>;
  commentId?: Types.ObjectId; // it this comment way a reply to another parent comment so here we store the id of the parent comment

  content?: string | undefined;
  attachments?: string[];

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[] | undefined;

  createdBy: Types.ObjectId;
  freezed?: IAtByObject;
  restored?: IAtByObject;

  createdAt: Date;
  updatedAt: Date;
}

export type HIComment = HydratedDocument<IComment>;
