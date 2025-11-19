import { z } from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
import { StorageTypesEnum } from "../../utils/constants/enum.constants.js";
class CommentValidator {
    static createComment = {
        params: z.strictObject({ postId: generalValidationFields.objectId }),
        body: z
            .strictObject({
            content: z.string().min(2).max(20000).optional(),
            attachments: z
                .array(generalValidationFields.fileKeys({
                storageApproach: StorageTypesEnum.memory,
                fieldName: "attachments",
                maxSize: 1 * 1024 * 1024,
                mimetype: fileValidation.image,
            }))
                .max(2)
                .optional(),
            tags: z.array(generalValidationFields.objectId).max(10).optional(),
        })
            .superRefine((data, ctx) => {
            if (!data.attachments?.length && !data.content?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["content"],
                    message: "A comment can not be created without either content or attachments",
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
    static reployOnComment = {
        params: this.createComment.params.extend({
            commentId: generalValidationFields.objectId,
        }),
        body: this.createComment.body,
    };
}
export default CommentValidator;
