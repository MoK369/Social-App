import type { HydratedDocument, Types } from "mongoose";

export interface IFriendRequest {
  createdBy: Types.ObjectId;
  sentTo: Types.ObjectId;
  acceptedAt?: Date;

  createdAt: Date;
}

export type HIFriednRequest = HydratedDocument<IFriendRequest>;
