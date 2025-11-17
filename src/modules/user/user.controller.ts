import { Router } from "express";
import userService from "./user.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import UserValidators from "./user.validation.ts";
import { TokenTypesEnum } from "../../utils/constants/enum.constants.ts";
import CloudMulter from "../../utils/multer/cloud.multer.ts";
import fileValidation from "../../utils/multer/file_validation.multer.ts";
import userAuthorizationEndpoints from "./user.authorization.ts";
import chatRouter from "../chat/index.ts";

const userRouter = Router();

userRouter.use("/:userId/chat", chatRouter);

userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);

userRouter.post(
  "/logout",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.logout),
  userService.logout
);

userRouter.post(
  "/refresh-token",
  Auths.authenticationMiddleware({ tokenType: TokenTypesEnum.refresh }),
  userService.refreshToken
);

userRouter.post(
  "/:userId/send-friend-request",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.sendFriendRequest),
  userService.sendFriendRequest
);

userRouter.post(
  "/enable-2fa",
  Auths.authenticationMiddleware(),
  userService.enableTwoFactor
);

userRouter.post(
  "/confirm-2fa",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.confirmTwoFactor),
  userService.confirmTwoFactor
);

userRouter.patch(
  "/profile-image",
  Auths.authenticationMiddleware(),
  CloudMulter.handleSingleFileUpload({
    fieldName: "image",
    validation: fileValidation.image,
    maxFileSize: 1024 * 1024,
  }),
  validationMiddleware(UserValidators.profileImage),
  userService.profileImage
);

userRouter.patch(
  "/profile-image-presigned-url",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.profileImageWithPresignedUrl),
  userService.profileImageWithPresignedUrl
);

userRouter.patch(
  "/profile-cover-images",
  Auths.authenticationMiddleware(),
  CloudMulter.handleArrayFilesUpload({
    fieldName: "images",
    validation: fileValidation.image,
    maxCount: 2,
    maxFileSize: 1024 * 1024,
  }),
  validationMiddleware(UserValidators.profileCoverImages),
  userService.profileCoverImages
);

userRouter.patch(
  "/accept-friend-request/:friendRequestId",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.acceptFriendRequest),
  userService.acceptFriendRequest
);

userRouter.patch(
  "/:userId/restore-account",
  Auths.combined({ accessRoles: userAuthorizationEndpoints.restoreAccount }),
  validationMiddleware(UserValidators.restoreAccount),
  userService.restoreAccount
);

userRouter.delete(
  "/reject-friend-request/:friendRequestId",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.rejectFreindRequest),
  userService.rejectFriendRequest
);

userRouter.delete(
  "{/:userId}/freeze-account",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.freezeAccount),
  userService.freezeAccount
);

userRouter.delete(
  "/:userId/delete-account",
  Auths.combined({ accessRoles: userAuthorizationEndpoints.deleteAccount }),
  validationMiddleware(UserValidators.deleteAccount),
  userService.hardDeleteAccount
);

export default userRouter;
