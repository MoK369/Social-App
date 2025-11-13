import { Router } from "express";
import Auths from "../../middlewares/auths.middlewares.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import ChatValidators from "./chat.validation.js";
import ChatService from "./chat.service.js";
const chatRouter = Router({ mergeParams: true });
const chatService = new ChatService();
chatRouter.get("/", Auths.authenticationMiddleware(), validationMiddleware(ChatValidators.getChat), chatService.getChat);
export default chatRouter;
