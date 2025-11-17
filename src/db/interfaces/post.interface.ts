import type { Types } from "mongoose";
import type {
  AllowCommentsEnum,
  AvailabilityEnum,
} from "../../utils/constants/enum.constants.ts";
import type { IAtByObject } from "./common.interface.ts";
import type { HydratedDocument } from "mongoose";

export interface IPost {
  content?: string;
  attachments?: string[];
  assetsFolderId: string;

  availability: AvailabilityEnum;
  allowComments: AllowCommentsEnum;

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

  createdBy: Types.ObjectId;
  freezed?: IAtByObject;
  restored?: IAtByObject;

  createdAt: Date;
  updatedAt: Date;
}

export type HIPost = HydratedDocument<IPost>;
