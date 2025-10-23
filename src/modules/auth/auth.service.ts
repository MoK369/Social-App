import type { Request, Response } from "express";
import type { ConfirmEmailBodyDtoType, SignupBodyDtoType } from "./auth.dto.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import {
  BadRequestException,
  ConflictException,
} from "../../utils/exceptions/custom.exceptions.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import Hashing from "../../utils/security/hash.security.ts";
import { EventsEnum } from "../../utils/constants/enum.constants.ts";
import { generateNumaricOTP } from "../../utils/security/otp.security.ts";
import emailEvent from "../../utils/events/email.event.ts";

class AuthenticationService {
  private userRepository = new UserRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { fullName, email, password, phone, gender }: SignupBodyDtoType =
      req.body;
    const user = await this.userRepository.findByEmail({ email });

    if (user) {
      throw new ConflictException("Email Already Exists!");
    }

    const otp = generateNumaricOTP();
    await this.userRepository.create({
      data: [
        {
          fullName,
          email,
          password: await Hashing.generateHash({ plainText: password }),
          phone,
          gender,
          confirmEmailOtp: {
            code: await Hashing.generateHash({ plainText: otp }),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        },
      ],
    });

    emailEvent.publish({
      eventName: EventsEnum.verifyEmail,
      payload: { to: email, otp },
    });
    return successHandler({
      res,
      statusCode: 201,
      message: "Account Created Succcessfully!",
    });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: ConfirmEmailBodyDtoType = req.body;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmailOtp: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });

    if (!user) {
      throw new ConflictException("Invalid Account or already Verified!");
    }

    if (Date.now() >= user.confirmEmailOtp?.expiresAt?.getTime()!) {
      throw new BadRequestException("OTP has expired!");
    }
    if (
      !(await Hashing.compareHash({
        plainText: otp,
        cipherText: user.confirmEmailOtp?.code!,
      }))
    ) {
      throw new BadRequestException("Invalid OTP!");
    }

    await this.userRepository.updateOne({
      filter: { email },
      update: {
        confirmedAt: Date.now(),
        $unset: {
          confirmEmailOtp: 1,
        },
      },
    });

    return successHandler({ res, message: "Account Verified!" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    return res.json({ message: "User logged in successfully", body: req.body });
  };
}

export default new AuthenticationService();
