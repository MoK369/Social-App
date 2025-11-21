import type { Types } from "mongoose";

export interface IAtByObject {
  at: Date;
  by: Types.ObjectId;
}

export interface ICodExpireCoundObject {
  code: string;
  expiresAt: Date;
  count?: number;
}
