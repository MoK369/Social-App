import { Router } from "express";
import userService from "./user.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import UserValidators from "./user.validation.js";
import { TokenTypesEnum } from "../../utils/constants/enum.constants.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
import userAuthorizationEndpoints from "./user.authorization.js";
const userRouter = Router();
userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.patch("/profile-image", Auths.authenticationMiddleware(), CloudMulter.handleSingleFileUpload({
    fieldName: "image",
    validation: fileValidation.image,
    maxFileSize: 1024 * 1024,
}), validationMiddleware(UserValidators.profileImage), userService.profileImage);
userRouter.patch("/profile-image-presigned-url", Auths.authenticationMiddleware(), validationMiddleware(UserValidators.profileImageWithPresignedUrl), userService.profileImageWithPresignedUrl);
userRouter.patch("/profile-cover-images", Auths.authenticationMiddleware(), CloudMulter.handleMultiFilesUpload({
    fieldName: "images",
    validation: fileValidation.image,
    maxCount: 2,
    maxFileSize: 1024 * 1024,
}), validationMiddleware(UserValidators.profileCoverImages), userService.profileCoverImages);
userRouter.post("/logout", Auths.authenticationMiddleware(), validationMiddleware(UserValidators.logout), userService.logout);
userRouter.post("/refresh-token", Auths.authenticationMiddleware({ tokenType: TokenTypesEnum.refresh }), userService.refreshToken);
userRouter.delete("{/:userId}/freeze-account", Auths.authenticationMiddleware(), validationMiddleware(UserValidators.freezeAccount), userService.freezeAccount);
userRouter.patch("/:userId/restore-account", Auths.combined({ accessRoles: userAuthorizationEndpoints.restoreAccount }), validationMiddleware(UserValidators.restoreAccount), userService.restoreAccount);
userRouter.delete("/:userId/delete-account", Auths.combined({ accessRoles: userAuthorizationEndpoints.deleteAccount }), validationMiddleware(UserValidators.deleteAccount), userService.hardDeleteAccount);
export default userRouter;
