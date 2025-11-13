import z from "zod";
import { LogoutStatusEnum } from "../../utils/constants/enum.constants.js";
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
        file: z
            .strictObject({
            fieldname: generalValidationFields.fileKeys.fieldname,
            originalname: generalValidationFields.fileKeys.originalname,
            encoding: generalValidationFields.fileKeys.encoding,
            mimetype: generalValidationFields.fileKeys.mimetype,
            buffer: generalValidationFields.fileKeys.buffer,
            size: generalValidationFields.fileKeys.size.max(1024 * 1024),
        }, { error: "image is missing" })
            .superRefine((data, ctx) => {
            if (data.fieldname !== "image") {
                ctx.addIssue({
                    code: "custom",
                    path: ["image"],
                    message: "image field is required",
                });
            }
            if (!fileValidation.image.includes(data.mimetype)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["image"],
                    message: "Invalid Image Type!",
                });
            }
        }),
    };
    static profileImageDisk = {
        file: z
            .strictObject({
            fieldname: generalValidationFields.fileKeys.fieldname,
            originalname: generalValidationFields.fileKeys.originalname,
            encoding: generalValidationFields.fileKeys.encoding,
            mimetype: generalValidationFields.fileKeys.mimetype,
            destination: generalValidationFields.fileKeys.destination,
            filename: generalValidationFields.fileKeys.fieldname,
            path: generalValidationFields.fileKeys.path,
            size: generalValidationFields.fileKeys.size.max(5 * 1024 * 1024),
        }, { error: "image is missing" })
            .superRefine((data, ctx) => {
            if (data.fieldname !== "image") {
                ctx.addIssue({
                    code: "custom",
                    path: ["image"],
                    message: "image field is required",
                });
            }
            if (!fileValidation.image.includes(data.mimetype)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["image"],
                    message: "Invalid Image Type!",
                });
            }
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
            .array(z
            .strictObject({
            fieldname: generalValidationFields.fileKeys.fieldname,
            originalname: generalValidationFields.fileKeys.originalname,
            encoding: generalValidationFields.fileKeys.encoding,
            mimetype: generalValidationFields.fileKeys.mimetype,
            buffer: generalValidationFields.fileKeys.buffer,
            size: generalValidationFields.fileKeys.size.max(1024 * 1024),
        }, { error: "image is missing" })
            .superRefine((data, ctx) => {
            if (data.fieldname !== "images") {
                ctx.addIssue({
                    code: "custom",
                    path: ["images"],
                    message: "image field is required",
                });
            }
            if (!fileValidation.image.includes(data.mimetype)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["images"],
                    message: "Invalid Image Type!",
                });
            }
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
