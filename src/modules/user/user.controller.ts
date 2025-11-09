import { Router } from "express";
import userService from "./user.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import UserValidators from "./user.validation.ts";
import { TokenTypesEnum } from "../../utils/constants/enum.constants.ts";
import CloudMulter from "../../utils/multer/cloud.multer.ts";
import fileValidation from "../../utils/multer/file_validation.multer.ts";

const userRouter = Router();

userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.patch(
  "/profile-image",
  Auths.authenticationMiddleware(),
  CloudMulter.handleSingleFileUpload({
    fieldName: "image",
    validation: fileValidation.image,
    maxFileSize: 1024 * 1024,
  }),
  validationMiddleware(UserValidators.profileImageWithPresignedUrl),
  userService.profileImage
);

userRouter.patch(
  "/profile-image-presigned-url",
  Auths.authenticationMiddleware(),
  validationMiddleware(UserValidators.profileImageWithPresignedUrl),
  userService.profileImageWithPresignedUrl
);

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

export default userRouter;
