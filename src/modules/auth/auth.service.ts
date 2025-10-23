import type { Request, Response } from "express";
import type { SignupDtoType } from "./auth.dto.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import { ConflictException } from "../../utils/exceptions/custom.exceptions.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import Hashing from "../../utils/security/hash.security.ts";
import sendEmail from "../../utils/email/send.email.ts";

class AuthenticationService {
  private userRepository = new UserRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    let { fullName, email, password, phone, gender }: SignupDtoType = req.body;
    const user = await this.userRepository.findByEmail({ email });
    if (user) {
      throw new ConflictException("Email Already Exists!");
    }

    await this.userRepository.create({
      data: [
        {
          fullName,
          email,
          password: await Hashing.generateHash({ plainText: password }),
          phone,
          gender,
        },
      ],
    });
    await sendEmail({data:{to:email,html:`<h1>Hello from Social App 👋</h1>`}});
    return successHandler({
      res,
      statusCode: 201,
      message: "Account Created Succcessfully!",
    });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    return res.json({ message: "User logged in successfully", body: req.body });
  };
}

export default new AuthenticationService();
