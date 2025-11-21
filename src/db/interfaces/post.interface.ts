import type { Default__v, Require_id, Types } from "mongoose";
import type {
  AllowCommentsEnum,
  AvailabilityEnum,
} from "../../utils/constants/enum.constants.ts";
import type { IAtByObject } from "./common.interface.ts";
import type { HydratedDocument } from "mongoose";

export interface IPost {
  content?: string | undefined;
  attachments?: string[];
  assetsFolderId: string;

  availability: AvailabilityEnum;
  allowComments: AllowCommentsEnum;

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[] | undefined;

  createdBy: Types.ObjectId;
  freezed?: IAtByObject;
  restored?: IAtByObject;

  createdAt: Date;
  updatedAt: Date;
}

export type FullIPost = Require_id<Default__v<IPost>>;
export type HIPost = HydratedDocument<IPost>;
