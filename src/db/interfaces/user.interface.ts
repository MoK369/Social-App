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

  gender: GenderEnum;
  role: UserRoleEnum;

  createdAt: Date;
  updatedAt: Date;
}

export type HIUser = HydratedDocument<IUser>;
