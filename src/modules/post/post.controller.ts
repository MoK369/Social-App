import { Router } from "express";
import PostService from "./post.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";
import CloudMulter from "../../utils/multer/cloud.multer.ts";
import fileValidation from "../../utils/multer/file_validation.multer.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import PostValidators from "./post.validation.ts";
import { commentRouter } from "../comment/index.ts";

const postRouter = Router();
postRouter.use("/:postId/comment", commentRouter);

const postService = new PostService();

postRouter.get(
  "/",
  Auths.authenticationMiddleware(),
  validationMiddleware(PostValidators.getPostList),
  postService.getPostList
);

postRouter.post(
  "/",
  Auths.authenticationMiddleware(),
  CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
  }),
  validationMiddleware(PostValidators.createPost),
  postService.createPost
);

postRouter.patch(
  "/:postId/like",
  Auths.authenticationMiddleware(),
  validationMiddleware(PostValidators.likePost),
  postService.likePost
);

postRouter.patch(
  "/:postId/freeze",
  Auths.authenticationMiddleware(),
  validationMiddleware(PostValidators.freezePost),
  postService.freezePost
);

postRouter.patch(
  "/:postId",
  Auths.authenticationMiddleware(),
  CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
  }),
  validationMiddleware(PostValidators.updatePost),
  postService.updatePost
);


postRouter.delete(
  "/:postId/delete",
  Auths.authenticationMiddleware(),
  validationMiddleware(PostValidators.deletePost),
  postService.deletePost
);


export default postRouter;
