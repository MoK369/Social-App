import z from "zod";
import { LogoutStatusEnum, StorageTypesEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import generalValidationFields from "../../utils/constants/validation.constants.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
class UserValidators {
    static logout = {
        body: z
            .strictObject({
            flag: z
                .enum(Object.values(LogoutStatusEnum), {
                error: `Invalid flag, expected values either ${Object.values(LogoutStatusEnum)}`,
            })
                .default(LogoutStatusEnum.one),
        })
            .default({ flag: LogoutStatusEnum.one }),
    };
    static profileImage = {
        file: generalValidationFields.fileKeys({
            storageApproach: StorageTypesEnum.memory,
            fieldName: "image",
            maxSize: 1024 * 1024,
            mimetype: fileValidation.image,
        }),
    };
    static profileImageDisk = {
        file: generalValidationFields.fileKeys({
            storageApproach: StorageTypesEnum.disk,
            fieldName: "image",
            maxSize: 5 * 1024 * 1024,
            mimetype: fileValidation.image,
        }),
    };
    static profileImageWithPresignedUrl = {
        body: z.strictObject({
            contentType: generalValidationFields.imageContentTypes,
            originalname: generalValidationFields.originalName,
        }),
    };
    static profileCoverImages = {
        files: z
            .array(generalValidationFields.fileKeys({
            storageApproach: StorageTypesEnum.memory,
            fieldName: "images",
            maxSize: 1024 * 1024,
            mimetype: fileValidation.image,
        }), { error: "Cover images are required" })
            .min(1, "At least 1 cover image should be uploaded")
            .max(2, "Maximum cover images are 2"),
    };
    static freezeAccount = {
        params: z
            .strictObject({
            userId: generalValidationFields.objectId.optional(),
        })
            .optional(),
    };
    static restoreAccount = {
        params: z.strictObject({
            userId: generalValidationFields.objectId,
        }, {
            error: "params argument is missing",
        }),
    };
    static changeRole = {
        params: this.restoreAccount.params,
        body: z.strictObject({
            role: z.enum(Object.values(UserRoleEnum)),
        }),
    };
    static deleteAccount = {
        params: z.strictObject({
            userId: generalValidationFields.objectId,
        }, {
            error: "params argument is missing",
        }),
    };
    static sendFriendRequest = {
        params: z.strictObject({
            userId: generalValidationFields.objectId,
        }),
    };
    static acceptFriendRequest = {
        params: z.strictObject({
            friendRequestId: generalValidationFields.objectId,
        }),
    };
    static rejectFreindRequest = {
        params: this.acceptFriendRequest.params.extend({}),
    };
    static confirmTwoFactor = {
        body: z.strictObject({
            otp: generalValidationFields.otp,
        }),
    };
}
export default UserValidators;
