import type { HIUser } from "../../db/interfaces/user.interface.ts";
import type { HIChat } from "../../db/interfaces/chat.interface.ts";

export interface ProfileResponseType {
  user: HIUser;
  groups: (HIChat | null)[];
}

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
