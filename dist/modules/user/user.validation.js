import z from "zod";
import { LogoutStatusEnum } from "../../utils/constants/enum.constants.js";
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
}
export default UserValidators;
