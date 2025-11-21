import mongoose, { Model, Types, type Require_id } from "mongoose";
import type { IUser } from "../interfaces/user.interface.ts";
import {
  GenderEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import EncryptionSecurityUtil from "../../utils/security/encryption.security.ts";
import Hashing from "../../utils/security/hash.security.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import KeyUtil from "../../utils/multer/key.multer.ts";
import {
  atByObjectSchema,
  codeExpireCountObjectSchema,
} from "./common.model.ts";

export const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true, minlength: 2, maxlength: 25 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 25 },

    email: { type: String, required: true, unique: true },
    confirmEmailOtp: codeExpireCountObjectSchema,
    confirmedAt: { type: Date },

    password: { type: String, required: true },
    resetPasswordOtp: codeExpireCountObjectSchema,
    resetPasswordVerificationExpiresAt: { type: Date },
    lastResetPasswordAt: { type: Date },

    twoFactorEnabledAt: Date,
    twoFactorOtp: codeExpireCountObjectSchema,

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
    freezed: atByObjectSchema,
    restored: atByObjectSchema,

    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: ModelsNames.userModel,
    },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.methods.toJSON = function () {
  const { id, ...restObj }: IUser = this.toObject();

  if (
    restObj.friends &&
    restObj.friends.length > 0 &&
    !Types.ObjectId.isValid(restObj.friends[0]!)
  ) {
    for (const friend of restObj.friends as unknown as Partial<
      Require_id<IUser>
    >[]) {
      friend.id = friend._id!;
      friend.fullName = `${friend.firstName} ${friend.lastName}`;
      delete friend._id;
      delete friend.firstName;
      delete friend.lastName;
    }
  }

  return {
    id: this._id,
    fullName: restObj.firstName
      ? `${restObj.firstName} ${restObj.lastName}`
      : undefined,
    email: restObj.email,
    phone: restObj.phone,
    gender: restObj.gender,
    role: restObj.role,
    profilePicture: restObj.profilePicture,
    coverImages: restObj.coverImages,
    createdAt: restObj.createdAt,
    updatedAt: restObj.updatedAt,
    confirmedAt: restObj.confirmedAt,
    friends: restObj.friends,
  };
};

userSchema.set("toObject", {
  transform: (doc, ret) => {
    console.log("inside transform of user toObject");

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

userSchema.pre(["find", "findOne"], function (next) {
  const query = this.getQuery();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ ...query, freezed: { $exists: false } });
  }

  next();
});

export const UserModel =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>(ModelsNames.userModel, userSchema);
