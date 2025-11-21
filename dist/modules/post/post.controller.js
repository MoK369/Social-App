import { Router } from "express";
import PostService from "./post.service.js";
import Auths from "../../middlewares/auths.middlewares.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import PostValidators from "./post.validation.js";
import { commentRouter } from "../comment/index.js";
const postRouter = Router();
postRouter.use("/:postId/comment", commentRouter);
const postService = new PostService();
postRouter.get("/", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.getPostList), postService.getPostList);
postRouter.get("/:postId", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.getPostById), postService.getPostById);
postRouter.post("/", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(PostValidators.createPost), postService.createPost);
postRouter.patch("/:postId/like", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.likePost), postService.likePost);
postRouter.patch("/:postId/freeze", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.freezePost), postService.freezePost);
postRouter.patch("/:postId", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(PostValidators.updatePost), postService.updatePost);
postRouter.delete("/:postId/delete", Auths.authenticationMiddleware(), validationMiddleware(PostValidators.deletePost), postService.deletePost);
export default postRouter;
