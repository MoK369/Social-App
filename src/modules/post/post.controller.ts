import { Router } from "express";
import PostService from "./post.service.ts";
import Auths from "../../middlewares/auths.middlewares.ts";

const postRouter = Router();

const postService = new PostService();

postRouter.post("/", Auths.authenticationMiddleware(), postService.createPost);

export default postRouter;
