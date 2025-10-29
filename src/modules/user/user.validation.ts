import z from "zod";
import { LogoutStatusEnum } from "../../utils/constants/enum.constants.ts";

class UserValidation {
  static logout = {
    body: z.strictObject({
      flag: z
        .enum(Object.values(LogoutStatusEnum), {
          error: `Invalid flag, expected values either ${Object.values(
            LogoutStatusEnum
          )}`,
        })
        .default(LogoutStatusEnum.one),
    }),
  };
}

export default UserValidation;
