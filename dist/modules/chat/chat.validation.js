import z from "zod";
import generalValidationFields from "../../utils/constants/validation.constants.js";
class ChatValidators {
    static getChat = {
        params: z.strictObject({
            userId: generalValidationFields.objectId,
        }),
    };
}
export default ChatValidators;
