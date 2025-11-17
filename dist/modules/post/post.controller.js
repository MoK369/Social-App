import { Router } from "express";
import PostService from "./post.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import PostValidators from "./post.validation.js";
const postRouter = Router();
const postService = new PostService();
postRouter.post("/", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(PostValidators.createPost), postService.createPost);
postRouter.patch("/:postId/like", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.likePost), postService.likePost);
postRouter.patch("/:postId", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(PostValidators.updatePost), postService.updatePost);
export default postRouter;
