import type { FlattenMaps, Types } from "mongoose";
import type { IUser } from "../../db/interfaces/user.interface.ts";

export type ProfileResponseType = FlattenMaps<IUser>;

export interface IProfileImageResponse {
  url: string;
}

export interface IProfileImageWithPresignedUrlResponse
  extends IProfileImageResponse {
  user: FlattenMaps<
    { profilePicture?: { url?: string } } & { _id: Types.ObjectId }
  >;
}

export interface IProfileCoverImagesResponse {
  coverImages: string[];
}

export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
