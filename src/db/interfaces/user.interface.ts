import type { Default__v, HydratedDocument, Require_id, Types } from "mongoose";
import type {
  GenderEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import type { IAtByObject, ICodExpireCoundObject } from "./common.interface.ts";

export interface IUser {
  id: Types.ObjectId;

  firstName: string;
  lastName: string;
  fullName?: string; // virtual

  email: string;
  confirmEmailOtp?: ICodExpireCoundObject;
  confirmedAt?: Date;

  password: string;
  resetPasswordOtp?: ICodExpireCoundObject;
  resetPasswordVerificationExpiresAt?: Date;
  lastResetPasswordAt?: Date;

  twoFactorEnabledAt?: Date;
  twoFactorOtp?: ICodExpireCoundObject;

  changeCredentialsTime?: Date;

  phone: string;

  profilePicture?: {
    subKey: string | undefined;
    url?: string;
  };
  tempProfilePicture?: {
    subKey: string | undefined;
  };
  coverImages?: string[];

  gender: GenderEnum;
  role: UserRoleEnum;

  createdAt: Date;
  updatedAt: Date;
  freezed?: IAtByObject;
  restored?: IAtByObject;

  friends: Types.ObjectId[];
}

export type FullIUser = Require_id<Default__v<IUser>>;
export type HIUser = HydratedDocument<IUser>;
