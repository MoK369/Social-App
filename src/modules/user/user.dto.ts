import type z from "zod";
import type UserValidation from "./user.validation.ts";

export type LogoutBodyTypeDto = z.infer<typeof UserValidation.logout.body>;
export type ProfileImageWithPresignedUrlBodyTypeDto = z.infer<
  typeof UserValidation.profileImageWithPresignedUrl.body
>;
export type FreezeAccountParamsTypeDto = z.infer<
  typeof UserValidation.freezeAccount.params
>;

export type RestoreAccountParamsTypeDto = z.infer<
  typeof UserValidation.restoreAccount.params
>;

export type DeleteAccountParamsTypeDto = z.infer<
  typeof UserValidation.deleteAccount.params
>;
