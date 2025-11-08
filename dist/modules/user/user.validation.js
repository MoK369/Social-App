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
}
export default UserValidators;
