import type { Types } from "mongoose";
import type { GenderEnum, UserRoleEnum } from "../../utils/constants/enum.constants.ts";

export interface IUser {
  id: Types.ObjectId;

  firstName: string;
  lastName: string;
  fullName?: string; // virtual

  email: string;
  confirmEmailOtp?: {
    code: string;
    expiresAt: Date;
  };
  confirmedAt?: Date;

  password: string;
  resetPasswordOtp?: {
    code: string;
    expiresAt: Date;
  };
  changeCredentialsTime?: Date;

  phoneNumber: string;

  gender: GenderEnum;
  role: UserRoleEnum;

  
  createdAt: Date;
  updatedAt: Date;
}
