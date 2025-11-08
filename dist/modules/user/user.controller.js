import { Router } from "express";
import userService from "./user.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import UserValidators from "./user.validation.js";
import { TokenTypesEnum } from "../../utils/constants/enum.constants.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
const userRouter = Router();
userRouter.get("/", Auths.authenticationMiddleware(), userService.profile);
userRouter.patch("/profile-image", Auths.authenticationMiddleware(), CloudMulter.handleSingleFileUpload({
    fieldName: "image",
    validation: fileValidation.image,
    maxFileSize: 1024 * 1024,
}), validationMiddleware(UserValidators.profileImage), userService.profileImage);
userRouter.post("/logout", Auths.authenticationMiddleware(), validationMiddleware(UserValidators.logout), userService.logout);
userRouter.post("/refresh-token", Auths.authenticationMiddleware({ tokenType: TokenTypesEnum.refresh }), userService.refreshToken);
export default userRouter;
