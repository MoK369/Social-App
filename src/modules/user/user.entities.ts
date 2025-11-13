import type { FlattenMaps } from "mongoose";
import type { IUser } from "../../db/interfaces/user.interface.ts";

export type ProfileResponseType = FlattenMaps<IUser>;

export interface IProfileImageResponse {
  url: string;
}

export interface IProfileImageWithPresignedUrlResponse
  extends IProfileImageResponse {
  profilePicture?: { url?: string };
}

export interface IProfileCoverImagesResponse {
  coverImages: string[];
}

export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
