import type { Request, Response } from "express";
import type { SignupDtoType } from "./auth.dto.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import { ConflictException } from "../../utils/exceptions/custom.exceptions.ts";

class AuthenticationService {
  private userRepository = new UserRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    let { fullName, email, password, phone, gender }: SignupDtoType = req.body;
    const user = await this.userRepository.findByEmail({email});
    console.log({ user });
    if (user) {
      throw new ConflictException("Email Already Exists!");
    }

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
