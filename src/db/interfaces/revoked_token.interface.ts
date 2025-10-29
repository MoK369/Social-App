import type { HydratedDocument, Types } from "mongoose";

export interface IRevokedToken {
  jti: string;
  expiresIn: number;
  userId: Types.ObjectId;
}

export type HIRevokedToken = HydratedDocument<IRevokedToken>;
