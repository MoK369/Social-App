import type { Types } from "mongoose";

export interface IAtByObject {
  at: Date;
  by: Types.ObjectId;
}
