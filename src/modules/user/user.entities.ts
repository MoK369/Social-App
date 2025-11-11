import type { FlattenMaps, Types } from "mongoose";
import type { IUser } from "../../db/interfaces/user.interface.ts";

export type ProfileResponseType = FlattenMaps<IUser>;

export interface IProfileImage {
  url: string;
}

export interface IProfileImageWithPresignedUrl extends IProfileImage {
  user: FlattenMaps<
    { profilePicture?: { url?: string } } & { _id: Types.ObjectId }
  >;
}

export interface IProfileCoverImages {
  coverImages: string[]
}
