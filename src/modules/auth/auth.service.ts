import type { Request, Response } from "express";
import type {
  ConfirmEmailBodyDtoType,
  LoginBodyDtoType,
  LoginTwoFactorBodyDtoType,
  ResendEmailOtpBodyDtoType,
  ResetForgotPasswordBodyDtoType,
  SendForgetPasswordOtpBodyDtoType,
  SignupBodyDtoType,
  VerifyForgetPasswordOtpBodyDtoType,
} from "./auth.dto.ts";
import {UserRepository} from "../../db/repository/index.ts";
import { UserModel } from "../../db/models/user.model.ts";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import Hashing from "../../utils/security/hash.security.ts";
import {
  EmailEventsEnum,
  EmailStatusEnum,
  OTPTypesEnum,
} from "../../utils/constants/enum.constants.ts";
import { generateNumericId } from "../../utils/security/id.security.ts";
import emailEvent from "../../utils/events/email.event.ts";
import type { HIUser } from "../../db/interfaces/user.interface.ts";
import Token from "../../utils/security/token.security.ts";
import OTP from "../../utils/security/otp.security.ts";
import type { ILoginResponse } from "./auth.entities.ts";

class AuthenticationService {
  private userRepository = new UserRepository(UserModel);

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { fullName, email, password, phone, gender }: SignupBodyDtoType =
      req.body;
    const user = await this.userRepository.findByEmail({ email });

    if (user) {
      throw new ConflictException("Email Already Exists!");
    }

    const otp = generateNumericId();
    await this.userRepository.create({
      data: [
        {
          fullName,
          email,
          password,
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
      eventName: EmailEventsEnum.verifyEmail,
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

  resendEmilOtp = async (req: Request, res: Response): Promise<Response> => {
    const { email }: ResendEmailOtpBodyDtoType = req.body;
    const user = await this.userRepository.findOne({
      filter: { email, freezed: { $exists: false } },
    });

    const count = OTP.checkRequestOfNewOTP({ user });

    const otp = generateNumericId();
    await this.userRepository.updateOne({
      filter: { _id: user!._id! },
      update: {
        confirmEmailOtp: {
          expiresAt: Date.now() + 10 * 60 * 1000,
          code: await Hashing.generateHash({
            plainText: otp,
          }),
          count,
        },
      },
    });
    emailEvent.publish({
      eventName: EmailEventsEnum.verifyEmail,
      payload: { to: email, otp },
    });
    return successHandler({ res, message: "OTP has been resent!" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: LoginBodyDtoType = req.body;

    const user: HIUser | null = await this.userRepository.findOne({
      filter: {
        email,
        freezed: { $exists: false },
      },
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

    // checking if 2FA is enabled
    if (user.twoFactorEnabledAt) {
      const count = OTP.checkRequestOfNewOTP({
        user,
        otpType: OTPTypesEnum.loginWithTwoFactor,
        checkEmailStatus: EmailStatusEnum.confirmed,
      });

      const otp = generateNumericId();

      await this.userRepository.updateOne({
        filter: { _id: user._id! },
        update: {
          twoFactorOtp: {
            expiresAt: Date.now() + 10 * 60 * 1000,
            code: await Hashing.generateHash({
              plainText: otp,
            }),
            count,
          },
        },
      });

      emailEvent.publish({
        eventName: EmailEventsEnum.loginWithTwoFactor,
        payload: { otp, to: user.email },
      });

      return successHandler({ res, message: "2FA login OTP has been sent!" });
    } else {
      const tokenCredentials = Token.getTokensBasedOnRole({ user });

      return successHandler<ILoginResponse>({
        res,
        message: "User logged in successfully",
        body: {
          ...tokenCredentials,
          user,
        },
      });
    }
  };

  loginTwoFactor = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body as LoginTwoFactorBodyDtoType;

    const user = await this.userRepository.findOne({
      filter: { email, freezed: { $exists: false } },
    });

    if (!user) {
      throw new NotFoundException("Invalid user account");
    }

    if (!user.twoFactorEnabledAt) {
      throw new BadRequestException("2FA is not enabled!");
    }

    if (!user.twoFactorOtp || !user.twoFactorOtp.code) {
      throw new BadRequestException("Login Credentials are not verified!");
    }

    if (
      Date.now() >= user.twoFactorOtp!.expiresAt.getTime() ||
      !(await Hashing.compareHash({
        plainText: otp,
        cipherText: user.twoFactorOtp!.code,
      }))
    ) {
      throw new BadRequestException("Invalid OTP or Has Expired!");
    }

    await this.userRepository.updateById({
      id: user._id!,
      update: {
        $unset: {
          twoFactorOtp: true,
        },
      },
    });

    const tokenCredentials = Token.getTokensBasedOnRole({ user });

    return successHandler<ILoginResponse>({
      res,
      message: "User logged in successfully",
      body: {
        ...tokenCredentials,
        user,
      },
    });
  };

  sendForgetPasswordOtp = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email }: SendForgetPasswordOtpBodyDtoType = req.body;

    const user = await this.userRepository.findByEmail({ email });

    if (
      user?.lastResetPasswordAt &&
      Date.now() <= user.lastResetPasswordAt.getTime() + 24 * 60 * 60 * 1000
    ) {
      throw new ForbiddenException(
        "You have reset your password recently, please try after 24 hours from last reset"
      );
    }
    const count = OTP.checkRequestOfNewOTP({
      user,
      otpType: OTPTypesEnum.forgetPasswordOTP,
      checkEmailStatus: EmailStatusEnum.confirmed,
    });
    const otp = generateNumericId();
    await this.userRepository.updateOne({
      filter: {
        _id: user!._id!,
      },
      update: {
        resetPasswordOtp: {
          expiresAt: Date.now() + 10 * 60 * 1000,
          code: await Hashing.generateHash({
            plainText: otp,
          }),
          count,
        },
        $unset: {
          resetPasswordVerificationExpiresAt: true,
        },
      },
    });
    emailEvent.publish({
      eventName: EmailEventsEnum.resetPassword,
      payload: { to: email, otp },
    });
    return successHandler({ res, message: "OTP has been sent!" });
  };
  verifyForgetPasswordOtp = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email, otp }: VerifyForgetPasswordOtpBodyDtoType = req.body;

    const user = await this.userRepository.findByEmail({ email });
    if (!user) {
      throw new BadRequestException("Invalid Account!");
    }
    if (!user?.resetPasswordOtp || !user.resetPasswordOtp!.code) {
      throw new NotFoundException("Please request an OTP");
    }

    if (
      Date.now() >= user.resetPasswordOtp!.expiresAt.getTime() ||
      !(await Hashing.compareHash({
        plainText: otp,
        cipherText: user.resetPasswordOtp!.code,
      }))
    ) {
      throw new BadRequestException("Invalid OTP or Has Expired!");
    }
    await this.userRepository.updateOne({
      filter: { _id: user._id! },
      update: {
        resetPasswordVerificationExpiresAt: Date.now() + 10 * 60 * 1000,
        $unset: {
          resetPasswordOtp: true,
        },
      },
    });
    return successHandler({ res, message: "OTP verified!" });
  };

  resetForgotPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { email, password }: ResetForgotPasswordBodyDtoType = req.body;

    const user = await this.userRepository.findByEmail({ email });
    if (!user) {
      throw new NotFoundException("Invalid Acccount!");
    }
    if (!user.resetPasswordVerificationExpiresAt) {
      throw new BadRequestException("Please Verify Your OTP");
    }
    if (Date.now() >= user.resetPasswordVerificationExpiresAt.getTime()) {
      throw new BadRequestException("OTP Verificatin has Expired!");
    }

    await this.userRepository.updateOne({
      filter: { _id: user._id! },
      update: {
        password: await Hashing.generateHash({ plainText: password }),
        lastResetPasswordAt: Date.now(),
        changeCredentialsTime: Date.now(),
        $unset: {
          resetPasswordVerificationExpiresAt: true,
        },
      },
    });
    return successHandler({ res, message: "Password Reset Successfully!" });
  };
}

export default new AuthenticationService();
