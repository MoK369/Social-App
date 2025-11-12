import mongoose, { Model } from "mongoose";
import { GenderEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import EncryptionSecurityUtil from "../../utils/security/encryption.security.js";
import Hashing from "../../utils/security/hash.security.js";
import ModelsNames from "../../utils/constants/models_names.constants.js";
const userSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.methods.toJSON = function () {
    const { id, fullName, ...restObj } = this.toObject();
    return {
        id: this._id,
        fullName,
        email: restObj.email,
        phone: restObj.phone,
        gender: restObj.gender,
        role: restObj.role,
        profilePicture: restObj.profilePicture,
        createdAt: restObj.createdAt,
        updatedAt: restObj.updatedAt,
        confirmedAt: restObj.confirmedAt,
    };
};
userSchema
    .virtual("fullName")
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
})
    .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
});
userSchema.pre("save", async function () {
    if (this.isModified("password") &&
        !Hashing.isHashed({ text: this.password })) {
        console.log("hashing the password");
        this.password = await Hashing.generateHash({ plainText: this.password });
    }
    if (this.isModified("phone") &&
        !EncryptionSecurityUtil.isEncrypted({ text: this.phone })) {
        this.phone = EncryptionSecurityUtil.encryptText({ plainText: this.phone });
    }
});
userSchema.post("init", async function () {
    if (this.phone && EncryptionSecurityUtil.isEncrypted({ text: this.phone })) {
        this.phone = EncryptionSecurityUtil.decryptText({ cipherText: this.phone });
    }
});
const UserModel = mongoose.models.User ||
    mongoose.model(ModelsNames.userModel, userSchema);
export default UserModel;
