import type { HydratedDocument, Types } from "mongoose";
import type {
  GenderEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";

export interface IUser {
  id: Types.ObjectId;

  firstName: string;
  lastName: string;
  fullName?: string; // virtual

  email: string;
  confirmEmailOtp?: {
    code: string;
    expiresAt: Date;
    count?: number;
  };
  confirmedAt?: Date;

  password: string;
  resetPasswordOtp?: {
    code: string;
    expiresAt: Date;
    count?: number;
  };
  resetPasswordVerificationExpiresAt?: Date;
  lastResetPasswordAt?: Date;
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
  freezed?: {
    at: Date;
    by: Types.ObjectId;
  };
  restored?: {
    at: Date;
    by: Types.ObjectId;
  };
}

export type HIUser = HydratedDocument<IUser>;
