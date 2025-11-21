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

export type ChangeRoleParamsTypeDto = z.infer<
  typeof UserValidation.changeRole.params
>;

export type ChangeRoleBodyTypeDto = z.infer<
  typeof UserValidation.changeRole.body
>;

export type DeleteAccountParamsTypeDto = z.infer<
  typeof UserValidation.deleteAccount.params
>;

export type SendFreindRequestParamsTypeDto = z.infer<
  typeof UserValidation.sendFriendRequest.params
>;

export type AcceptFriendRequestParamsTypeDto = z.infer<
  typeof UserValidation.acceptFriendRequest.params
>;

export type RejectFriendRequestParamsTypeDto = z.infer<
  typeof UserValidation.rejectFreindRequest.params
>;

export type UnfriendParamsTypeDto = z.infer<
  typeof UserValidation.unFriend.params
>;

export type ConfirmTwoFactorBodyTypeDto = z.infer<
  typeof UserValidation.confirmTwoFactor.body
>;
