import { Router } from "express";
import Auths from "../../middlewares/auths.middlewares.ts";
import validationMiddleware from "../../middlewares/validation.middleware.ts";
import ChatValidators from "./chat.validation.ts";
import ChatService from "./chat.service.ts";

const chatRouter = Router({ mergeParams: true });

const chatService = new ChatService();
chatRouter.get(
  "/",
  Auths.authenticationMiddleware(),
  validationMiddleware(ChatValidators.getChat),
  chatService.getChat
);

export default chatRouter;
