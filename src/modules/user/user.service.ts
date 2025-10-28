import type { Request, Response } from "express";
import UserModel from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";

class UserService {
  protected userRepository = new UserRepository(UserModel);

  profile = async (req: Request, res: Response): Promise<Response> => {
    return successHandler({ res, message: "User Profile!", body: req.user! });
  };
}

export default new UserService();
