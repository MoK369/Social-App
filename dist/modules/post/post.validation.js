import { z } from "zod";
import { AllowCommentsEnum, AvailabilityEnum, LikeActionsEnum, StorageTypesEnum, } from "../../utils/constants/enum.constants.js";
import generalValidationFields from "../../utils/constants/validation.constants.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
class PostValidators {
    static createPost = {
        body: z
            .strictObject({
            content: z.string().min(2).max(20000).optional(),
            attachments: z
                .array(generalValidationFields.fileKeys({
                storageApproach: StorageTypesEnum.memory,
                fieldName: "attachments",
                maxSize: 5 * 1024 * 1024,
                mimetype: fileValidation.image,
            }))
                .max(2)
                .optional(),
            availability: z
                .enum(Object.values(AvailabilityEnum))
                .default(AvailabilityEnum.public),
            allowComments: z
                .enum(Object.values(AllowCommentsEnum))
                .default(AllowCommentsEnum.allow),
            tags: z.array(generalValidationFields.objectId).max(10).optional(),
        })
            .superRefine((data, ctx) => {
            if (!data.attachments?.length && !data.content?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["content"],
                    message: "A post can not be created without either content or attachments",
                });
            }
            if (data.attachments?.length &&
                data.attachments[0].fieldname !== "attachments") {
                ctx.addIssue({
                    code: "custom",
                    path: ["attachments"],
                    message: "attachments field is missing",
                });
            }
            if (data.tags?.length &&
                data.tags.length !== [...new Set(data.tags)].length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplication exists in tagged users",
                });
            }
        }),
    };
    static likePost = {
        params: z.strictObject({
            postId: generalValidationFields.objectId,
        }),
        query: z.strictObject({
            action: z
                .enum(Object.values(LikeActionsEnum))
                .default(LikeActionsEnum.like),
        }),
    };
    static updatePost = {
        params: z.strictObject({
            postId: generalValidationFields.objectId,
        }),
        body: z
            .strictObject({
            content: z.string().min(2).max(20000).optional(),
            availability: z.enum(Object.values(AvailabilityEnum)).optional(),
            allowComments: z.enum(Object.values(AllowCommentsEnum)).optional(),
            attachments: z
                .array(generalValidationFields.fileKeys({
                storageApproach: StorageTypesEnum.memory,
                fieldName: "attachments",
                maxSize: 5 * 1024 * 1024,
                mimetype: fileValidation.image,
            }))
                .max(2)
                .optional(),
            removedAttachments: z.array(z.string()).max(2).optional(),
            tags: z.array(generalValidationFields.objectId).max(10).optional(),
            removedTags: z.array(generalValidationFields.objectId).max(10).optional(),
        })
            .superRefine((data, ctx) => {
            if (!Object.values(data).length) {
                ctx.addIssue({
                    code: "custom",
                    path: [""],
                    message: "All fields are empty",
                });
            }
            if (data.attachments?.length &&
                data.attachments[0].fieldname !== "attachments") {
                ctx.addIssue({
                    code: "custom",
                    path: ["attachments"],
                    message: "attachments field is missing",
                });
            }
            if (data.tags?.length &&
                data.tags.length !== [...new Set(data.tags)].length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tags"],
                    message: "Duplication exists in tagged users",
                });
            }
            if (data.removedTags?.length &&
                data.removedTags.length !== [...new Set(data.removedTags)].length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["removedTags"],
                    message: "Duplication exists in remove tagged users",
                });
            }
        }),
    };
}
export default PostValidators;
