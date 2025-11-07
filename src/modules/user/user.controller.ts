import { Router } from "express";
import userService from "./user.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import UserValidators from "./user.validation.ts";
import {
  //StorageTypesEnum,
  TokenTypesEnum,
} from "../../utils/constants/enum.constants.ts";
// import CloudMulter from "../../utils/multer/cloud.multer.ts";
// import fileValidation from "../../utils/multer/file_validation.multer.ts";

const userRouter = Router();

userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.patch(
  "/profile-image",
  Auths.authenticationMiddleware(),
  // CloudMulter.handleSingleFileUpload({
  //   storageApproach: StorageTypesEnum.disk,
  //   fieldName: "image",
  //   validation: fileValidation.image,
  //   maxFileSize: 5 * 1024 * 1024,
  // }),
  // validationMiddleware(UserValidators.profileImageDisk),
  userService.profileImage
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
