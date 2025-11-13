import type { Request, Response } from "express";
import { UserModel, userSchema } from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import type {
  AcceptFriendRequestParamsTypeDto,
  ConfirmTwoFactorBodyTypeDto,
  DeleteAccountParamsTypeDto,
  FreezeAccountParamsTypeDto,
  LogoutBodyTypeDto,
  ProfileImageWithPresignedUrlBodyTypeDto,
  RejectFriendRequestParamsTypeDto,
  RestoreAccountParamsTypeDto,
  SendFreindRequestParamsTypeDto,
} from "./user.dto.ts";
import RevokedTokenModel from "../../db/models/revoked_token.model.ts";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.ts";
import Token from "../../utils/security/token.security.ts";
import S3Service from "../../utils/multer/s3.service.ts";
import KeyUtil from "../../utils/multer/key.multer.ts";
import s3Events from "../../utils/events/s3.events.ts";
import {
  EmailEventsEnum,
  EmailStatusEnum,
  OTPTypesEnum,
  S3EventsEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import type {
  IProfileCoverImagesResponse,
  IProfileImageResponse,
  IProfileImageWithPresignedUrlResponse,
  IRefreshTokenResponse,
  ProfileResponseType,
} from "./user.entities.ts";
import FriendRequestRepository from "../../db/repository/friend_request.repository.ts";
import FriendRequestModel from "../../db/models/friend_request.model.ts";
import OTP from "../../utils/security/otp.security.ts";
import { generateNumericId } from "../../utils/security/id.security.ts";
import Hashing from "../../utils/security/hash.security.ts";
import emailEvent from "../../utils/events/email.event.ts";
import type { LeanType } from "../../utils/types/find_functions.type.ts";
import type { IUser } from "../../db/interfaces/user.interface.ts";
import mongoose, { type Default__v, type Require_id } from "mongoose";

class UserService {
  protected userRepository = new UserRepository(UserModel);
  protected revokedTokenRepository = new RevokedTokenRepository(
    RevokedTokenModel
  );
  protected friendRequestRepository = new FriendRequestRepository(
    FriendRequestModel
  );

  enableTwoFactor = async (req: Request, res: Response): Promise<Response> => {
    const count = OTP.checkRequestOfNewOTP({
      user: req.user!,
      otpType: OTPTypesEnum.enableTwoFactor,
      checkEmailStatus: EmailStatusEnum.confirmed,
    });

    const otp = generateNumericId();

    await this.userRepository.updateOne({
      filter: { _id: req.user!._id! },
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
      eventName: EmailEventsEnum.enableTwoFactor,
      payload: { otp, to: req.user!.email },
    });

    return successHandler({ res, message: "Enable 2FA OTP has been sent!" });
  };

  confirmTwoFactor = async (req: Request, res: Response): Promise<Response> => {
    const { otp } = req.body as ConfirmTwoFactorBodyTypeDto;

    if (req.user!.twoFactorEnabledAt) {
      throw new BadRequestException("2FA is already enabled");
    }

    if (!req.user!.twoFactorOtp || !req.user!.twoFactorOtp.code) {
      throw new BadRequestException("Please request an OTP to enable 2FA");
    }

    if (
      Date.now() >= req.user!.twoFactorOtp!.expiresAt.getTime() ||
      !(await Hashing.compareHash({
        plainText: otp,
        cipherText: req.user!.twoFactorOtp!.code,
      }))
    ) {
      throw new BadRequestException("Invalid OTP or Has Expired!");
    }

    await this.userRepository.updateById({
      id: req.user!._id!,
      update: {
        twoFactorEnabledAt: new Date(),
        $unset: { twoFactorOtp: true },
      },
    });

    return successHandler({
      res,
      message: "2FA has been Enabled Successfully",
    });
  };

  profile = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.userRepository.findById({
      id: req.user!._id!,
      options: {
        populate: [
          {
            path: "friends",
            select: "firstName lastName fullName email profilePicture",
          },
        ],
      },
    });
    return successHandler<ProfileResponseType>({
      res,
      message: "User Profile!",
      body: user!,
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const uploadSubKey = await S3Service.uploadFile({
      File: req.file!,
      Path: `users/${req.tokenPayload?.id}/profile`,
    });

    const { subKey } = req.user?.profilePicture || {};
    if (subKey) {
      // delete previous image from s3
      await S3Service.deleteFile({
        SubKey: subKey,
      });
    }

    await this.userRepository.updateOne({
      filter: { _id: req.user!._id! },
      update: { profilePicture: { subKey: uploadSubKey } },
    });

    return successHandler<IProfileImageResponse>({
      res,
      message: "Image Uploaded !",
      body: {
        url: KeyUtil.generateS3UploadsUrlFromSubKey({
          req,
          subKey: uploadSubKey,
        }),
      },
    });
  };

  profileImageWithPresignedUrl = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const {
      contentType,
      originalname,
    }: ProfileImageWithPresignedUrlBodyTypeDto = req.body;
    const { url, key } = await S3Service.createPresignedUploadUrl({
      contentType,
      originalname,
      Path: `users/${req.tokenPayload?.id}/profile`,
    });

    const user = await this.userRepository.findByIdAndUpdate({
      id: req.user!._id!,
      update: {
        profilePicture: { subKey: key },
        tempProfilePicture: { subKey: req.user!.profilePicture?.subKey },
      },
      options: {
        new: true,
        projection: { profilePicture: 1 },
        lean: {
          transform: (doc: Default__v<Require_id<IUser>>, ret: any) => {
            const fn = userSchema.get("toObject")!.transform;
            if (typeof fn === "function") return fn(ret, doc, {});
          },
        } as unknown as LeanType,
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid account");
    }

    s3Events.publish({
      eventName: S3EventsEnum.trackProfileImageUpload,
      payload: {
        userId: user._id,
        oldSubKey: req.user!.profilePicture?.subKey,
        newSubKey: key,
      },
    });

    return successHandler<IProfileImageWithPresignedUrlResponse>({
      res,
      message: "Image Uploaded !",
      body: { url, profilePicture: user?.profilePicture! },
    });
  };

  profileCoverImages = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const uploadSubKeys = await S3Service.uploadFiles({
      Files: req.files! as Express.Multer.File[],
      Path: `users/${req.tokenPayload?.id}/profile/covers`,
    });

    if (req.user!.coverImages && req.user!.coverImages.length > 0) {
      await S3Service.deleteFiles({ SubKeys: req.user!.coverImages });
    }

    const user = await this.userRepository.findByIdAndUpdate({
      id: req.user!._id,
      update: {
        coverImages: uploadSubKeys,
      },
      options: {
        new: true,
        lean: {
          transform: (doc: Default__v<Require_id<IUser>>, ret: any) => {
            const fn = userSchema.get("toObject")!.transform;
            if (typeof fn === "function") return fn(ret, doc, {});
          },
        } as unknown as LeanType,
        projection: { coverImages: 1 },
      },
    });

    return successHandler<IProfileCoverImagesResponse>({
      res,
      message: "Cover Images Uploaded Successfully!",
      body: {
        coverImages: user?.coverImages || [],
      },
    });
  };

  freezeAccount = async (req: Request, res: Response): Promise<Response> => {
    const { userId }: FreezeAccountParamsTypeDto = req.params;

    if (userId && req.user!.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException("Not Authorized User");
    }

    const result = await this.userRepository.updateOne({
      filter: {
        _id: userId || req.user!._id!,
        freezed: { $exists: false },
      },
      update: {
        freezed: {
          at: new Date(),
          by: req.user!._id,
        },
        changeCredentialsTime: new Date(),
        $unset: {
          restored: true,
        },
      },
    });

    if (result.modifiedCount === 0) {
      throw new NotFoundException("user not found or already freezed");
    }

    return successHandler({ res, message: "Account Freezed!" });
  };

  restoreAccount = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as RestoreAccountParamsTypeDto;

    const result = await this.userRepository.updateOne({
      filter: {
        _id: userId,
        freezed: { $exists: true },
        "freezed.by": { $ne: userId },
      },
      update: {
        restored: {
          at: new Date(),
          by: req.user!._id,
        },
        $unset: {
          freezed: true,
        },
      },
    });

    if (result.modifiedCount === 0) {
      throw new NotFoundException("user not found or already restored");
    }

    return successHandler({ res, message: "Account Restored!" });
  };

  hardDeleteAccount = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { userId } = req.params as DeleteAccountParamsTypeDto;

    const result = await this.userRepository.deleteOne({
      filter: {
        _id: userId,
        freezed: { $exists: true },
      },
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException("invalid user account or already deleted");
    }

    await S3Service.deleteFolderByPrefix({ FolderPath: `users/${userId}` });

    return successHandler({ res, message: "Account Deleted Permanently!" });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutBodyTypeDto = req.validationResult.body;

    const statusCode = await Token.revoke({
      flag,
      userId: req.user!._id!,
      tokenPayload: req.tokenPayload!,
    });
    return successHandler({
      res,
      statusCode,
      message: `Logged out ${flag} Successfully!`,
    });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const newTokens = Token.getTokensBasedOnRole({ user: req.user! });
    const statusCode = await Token.revoke({
      userId: req.user!._id!,
      tokenPayload: req.tokenPayload!,
    });
    return successHandler<IRefreshTokenResponse>({
      res,
      statusCode,
      message: "Got New Credentials",
      body: newTokens,
    });
  };

  sendFriendRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { userId } = req.params as SendFreindRequestParamsTypeDto;

    if (req.user!._id!.equals(userId)) {
      throw new ConflictException("Can't send friend request to yourself");
    }

    const checkFriendRequestExists = await this.friendRequestRepository.findOne(
      {
        filter: {
          createdBy: { $in: [req.user!._id!, userId] },
          sentTo: { $in: [req.user!._id!, userId] },
        },
      }
    );

    if (checkFriendRequestExists) {
      throw new ConflictException("Friend request already exists 🙂");
    }

    const user = await this.userRepository.findOne({
      filter: {
        _id: userId,
        freezed: { $exists: false },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid recipient 🚫");
    }

    await this.friendRequestRepository.create({
      data: [
        {
          createdBy: req.user!._id!,
          sentTo: new mongoose.Types.ObjectId(userId),
        },
      ],
    });

    return successHandler({
      res,
      statusCode: 201,
      message: "Friend Request Sent Successfully 👍",
    });
  };

  acceptFriendRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { friendRequestId } = req.params as AcceptFriendRequestParamsTypeDto;

    const friendRequest = await this.friendRequestRepository.findOneAndUpdate({
      filter: {
        _id: friendRequestId,
        sentTo: req.user!._id!,
        acceptedAt: { $exists: false },
      },
      update: {
        acceptedAt: new Date(),
      },
    });

    if (!friendRequest) {
      throw new NotFoundException(
        "Friend request doesn't exist or already accepted "
      );
    }

    await Promise.all([
      this.userRepository.updateById({
        id: friendRequest.createdBy,
        update: {
          $addToSet: { friends: friendRequest.sentTo },
        },
      }),

      this.userRepository.updateById({
        id: friendRequest.sentTo,
        update: {
          $addToSet: { friends: friendRequest.createdBy },
        },
      }),
    ]);

    return successHandler({ res });
  };

  rejectFriendRequest = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { friendRequestId } = req.params as RejectFriendRequestParamsTypeDto;

    const friendRequest = await this.friendRequestRepository.findOneAndDelete({
      filter: {
        _id: friendRequestId,
        sentTo: req.user!._id!,
        acceptedAt: { $exists: false },
      },
    });

    if (!friendRequest) {
      throw new NotFoundException(
        "Failed to reject, friend request doesn't exist or already accepted"
      );
    }

    return successHandler({ res });
  };
}

export default new UserService();
