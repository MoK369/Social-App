import type { Request, Response } from "express";
import successHandler from "../../utils/handlers/success.handler.ts";
import { PostRepository, UserRepository } from "../../db/repository/index.ts";
import PostModel from "../../db/models/post.model.ts";
import { UserModel } from "../../db/models/user.model.ts";

class PostService {
  private _postRepository = new PostRepository(PostModel);
  private _userRepository = new UserRepository(UserModel);
  createPost = async (req: Request, res: Response): Promise<Response> => {
    return successHandler({ res, statusCode: 201 });
  };
}

export default PostService;
