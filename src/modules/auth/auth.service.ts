import type { Request, Response } from "express";
import type {
  ConfirmEmailBodyDtoType,
  LoginBodyDtoType,
  SignupBodyDtoType,
} from "./auth.dto.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import Hashing from "../../utils/security/hash.security.ts";
import { EventsEnum } from "../../utils/constants/enum.constants.ts";
import { generateNumaricOTP } from "../../utils/security/otp.security.ts";
import emailEvent from "../../utils/events/email.event.ts";
import type { HIUser } from "../../db/interfaces/user.interface.ts";
import Token from "../../utils/security/token.security.ts";

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
    const { email, password }: LoginBodyDtoType = req.body;

    const user: HIUser | null = await this.userRepository.findByEmail({
      email,
    });
    if (!user) {
      throw new NotFoundException("Invalid Login Credentials");
    }

    if (!user.confirmedAt) {
      throw new BadRequestException("Email Not Verified");
    }

    if (
      !(await Hashing.compareHash({
        plainText: password,
        cipherText: user.password,
      }))
    ) {
      throw new NotFoundException("Invalid Login Credentials");
    }

    const accessToken = Token.generate({ payload: { id: user.id } });
    const refreshToken = Token.generate({
      payload: { id: user.id },
      secret: process.env.REFRESH_USER_TOKEN_SIGNATURE as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
      },
    });

    return res.json({
      message: "User logged in successfully",
      body: {
        accessToken,
        refreshToken,
        user,
      },
    });
  };
}

export default new AuthenticationService();
