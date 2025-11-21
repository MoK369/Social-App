import z from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.ts";
import fileValidation from "../../utils/multer/file_validation.multer.ts";

abstract class ChatValidators {
  static getChat = {
    params: z.strictObject({
      userId: generalValidationFields.objectId,
    }),
    query: z.strictObject({
      page: z.coerce.number().int().min(1).max(100).optional(),
      size: z.coerce.number().int().min(1).max(100).optional(),
    }),
  };

  static getChatGroup = {
    params: z.strictObject({
      groupId: generalValidationFields.objectId,
    }),
    query: this.getChat.query,
  };

  static createChatGroup = {
    body: z
      .strictObject({
        participants: z.array(generalValidationFields.objectId).min(1),
        groupName: z.string().min(5).max(500),
        attachment: generalValidationFields
          .fileKeys({
            fieldName: "attachment",
            maxSize: 1 * 1024 * 1024,
            mimetype: fileValidation.image,
          })
          .optional(),
      })
      .superRefine((data, ctx) => {
        if (
          data.participants?.length &&
          data.participants.length !== [...new Set(data.participants)].length
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplication exists in tagged users",
          });
        }
      }),
  };
}

export default ChatValidators;
