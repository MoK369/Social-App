import { Router } from "express";
import Auths from "../../middlewares/auths.middlewares.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import CommentService from "./comment.service.js";
import CommentValidator from "./comment.validation.js";
const commentRouter = Router({ mergeParams: true });
const commentService = new CommentService();
commentRouter.post("/", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 1 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(CommentValidator.createComment), commentService.createComment);
commentRouter.post("/:commentId/reply", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 1 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(CommentValidator.reployOnComment), commentService.repylOnComment);
commentRouter.patch("/:commentId", Auths.authenticationMiddleware(), CloudMulter.handleArrayFilesUpload({
    fieldName: "attachments",
    maxCount: 2,
    maxFileSize: 5 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(CommentValidator.updateComment), commentService.updateComment);
commentRouter.patch("/:commentId/freeze", Auths.authenticationMiddleware(), validationMiddleware(CommentValidator.freezeComment), commentService.freezeComment);
commentRouter.delete("/:commentId/delete", Auths.authenticationMiddleware(), validationMiddleware(CommentValidator.deleteComment), commentService.deleteComment);
export default commentRouter;
