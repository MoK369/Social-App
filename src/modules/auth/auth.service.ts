import type { Request, Response } from "express";
import type { SignupDtoType } from "./auth.dto.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";

class AuthenticationService {
  private userRepository = new UserRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { fullName, email, password, phone, gender }: SignupDtoType =
      req.body;
    await this.userRepository.create({
      data: [{ fullName, email, password, phone, gender }],
    });

    return res.status(201).json({ message: "User signed up successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    return res.json({ message: "User logged in successfully", body: req.body });
  };
}

export default new AuthenticationService();
