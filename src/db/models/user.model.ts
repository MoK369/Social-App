import mongoose from "mongoose";
import type { IUser } from "../interfaces/user.interface.ts";
import { GenderEnum, UserRoleEnum } from "../../utils/constants/enum.constants.ts";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },

    email: { type: String, required: true, unique: true, },
    confirmEmailOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    confirmedAt: { type: Date },

    password: { type: String, required: true },
    resetPasswordOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    changeCredentialsTime: { type: Date },

    phone: { type: String, required: true },

    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.USER,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
}).set(function (value: string){
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
});

const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;