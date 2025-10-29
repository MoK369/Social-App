import type { Request, Response } from "express";
import UserModel from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";

class UserService {
  protected userRepository = new UserRepository(UserModel);

  profile = async (req: Request, res: Response): Promise<Response> => {
    return successHandler({ res, message: "User Profile!", body: req.user! });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag } = req.body;
    return successHandler({ res, message: "Logged out Successfully!" });
  };
}

export default new UserService();
