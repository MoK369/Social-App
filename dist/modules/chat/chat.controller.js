import { Router } from "express";
import Auths from "../../middlewares/auths.middlewares.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import ChatValidators from "./chat.validation.js";
import ChatService from "./chat.service.js";
import CloudMulter from "../../utils/multer/cloud.multer.js";
import fileValidation from "../../utils/multer/file_validation.multer.js";
const chatRouter = Router({ mergeParams: true });
const chatService = new ChatService();
chatRouter.get("/", Auths.authenticationMiddleware(), validationMiddleware(ChatValidators.getChat), chatService.getChat);
chatRouter.get("/group/:groupId", Auths.authenticationMiddleware(), validationMiddleware(ChatValidators.getChatGroup), chatService.getChatGroup);
chatRouter.post("/group", Auths.authenticationMiddleware(), CloudMulter.handleSingleFileUpload({
    fieldName: "attachment",
    maxFileSize: 1 * 1024 * 1024,
    validation: fileValidation.image,
}), validationMiddleware(ChatValidators.createChatGroup), chatService.createChatGroup);
export default chatRouter;
