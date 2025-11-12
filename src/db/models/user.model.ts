import mongoose, { Model } from "mongoose";
import type { IUser } from "../interfaces/user.interface.ts";
import {
  GenderEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import EncryptionSecurityUtil from "../../utils/security/encryption.security.ts";
import Hashing from "../../utils/security/hash.security.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import KeyUtil from "../../utils/multer/key.multer.ts";

export const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      count: { type: Number, default: 0 },
    },
    confirmedAt: { type: Date },

    password: { type: String, required: true },
    resetPasswordOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      count: { type: Number, default: 0 },
    },
    resetPasswordVerificationExpiresAt: { type: Date },
    lastResetPasswordAt: { type: Date },

    twoFactorEnabledAt: Date,
    twoFactorOtp: {
      code: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },

    changeCredentialsTime: { type: Date },

    phone: { type: String, required: true },

    profilePicture: {
      subKey: { type: String },
    },
    tempProfilePicture: {
      subKey: { type: String },
    },
    coverImages: [{ type: String }],

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
    freezed: {
      at: Date,
      by: { type: mongoose.Types.ObjectId, ref: ModelsNames.userModel },
    },
    restored: {
      at: Date,
      by: { type: mongoose.Types.ObjectId, ref: ModelsNames.userModel },
    },

    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: ModelsNames.userModel,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.toJSON = function () {
  const { id, fullName, ...restObj }: IUser = this.toObject();

  return {
    id: this._id,
    fullName,
    email: restObj.email,
    phone: restObj.phone,
    gender: restObj.gender,
    role: restObj.role,
    profilePicture: restObj.profilePicture,
    coverImages: restObj.coverImages,
    createdAt: restObj.createdAt,
    updatedAt: restObj.updatedAt,
    confirmedAt: restObj.confirmedAt,
  };
};

userSchema.set("toObject", {
  transform: (doc, ret) => {
    console.log("inside toObject transform =========");
    console.log({ doc, ret });

    if (ret?.profilePicture?.subKey) {
      ret.profilePicture.url = KeyUtil.generateS3UploadsUrlFromSubKey({
        req: {
          host: process.env.HOST!,
          protocol: process.env.PROTOCOL!,
        },
        subKey: ret.profilePicture.subKey!,
      });
      ret.profilePicture.subKey = undefined;
    }

    if (ret?.coverImages && ret.coverImages.length > 0) {
      for (let i = 0; i < ret.coverImages.length; i++) {
        ret.coverImages[i] = KeyUtil.generateS3UploadsUrlFromSubKey({
          req: { host: process.env.HOST!, protocol: process.env.PROTOCOL! },
          subKey: ret.coverImages[i]!,
        });
      }
    }

    return ret;
  },
});

userSchema
  .virtual("fullName")
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  })
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  });

userSchema.pre("save", async function () {
  if (
    this.isModified("password") &&
    !Hashing.isHashed({ text: this.password })
  ) {
    console.log("hashing the password");

    this.password = await Hashing.generateHash({ plainText: this.password });
  }

  if (
    this.isModified("phone") &&
    !EncryptionSecurityUtil.isEncrypted({ text: this.phone })
  ) {
    this.phone = EncryptionSecurityUtil.encryptText({ plainText: this.phone });
  }
});

userSchema.post("init", async function () {
  if (this.phone && EncryptionSecurityUtil.isEncrypted({ text: this.phone })) {
    this.phone = EncryptionSecurityUtil.decryptText({ cipherText: this.phone });
  }
});

export const UserModel =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>(ModelsNames.userModel, userSchema);
