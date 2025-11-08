import type { Request, Response } from "express";
import UserModel from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import type { LogoutBodyTypeDto } from "./user.dto.ts";
import RevokedTokenModel from "../../db/models/revoked_token.model.ts";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.ts";
import Token from "../../utils/security/token.security.ts";
import S3Service from "../../utils/multer/s3.service.ts";
import KeyUtil from "../../utils/multer/key.multer.ts";

class UserService {
  protected userRepository = new UserRepository(UserModel);
  protected revokedTokenRepository = new RevokedTokenRepository(
    RevokedTokenModel
  );

  profile = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user!.toJSON();
    if (user.profilePicture?.subKey) {
      user.profilePicture.url = KeyUtil.generateS3UploadsUrlFromSubKey({
        req,
        subKey: user.profilePicture.subKey || "",
      });
      user.profilePicture.subKey = undefined;
    }
    return successHandler({ res, message: "User Profile!", body: user });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const { subKey } = req.user?.profilePicture || {};
    if (subKey) {
      // delete previous image from s3
      await S3Service.deleteFile({
        Key: KeyUtil.generateS3KeyFromSubKey(subKey),
      });
    }

    const uploadSubKey = await S3Service.uploadFile({
      File: req.file!,
      Path: `users/${req.tokenPayload?.id}/profile`,
    });

    await this.userRepository.updateOne({
      filter: { _id: req.user!._id! },
      update: { profilePicture: { subKey: uploadSubKey } },
    });

    return successHandler({
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
    }: { contentType: string; originalname: string } = req.body;
    const { url, key } = await S3Service.createPresignedUploadUrl({
      contentType,
      originalname,
      Path: `users/${req.tokenPayload?.id}`,
    });

    return successHandler({
      res,
      message: "Image Uploaded !",
      body: { url, key },
    });
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
    return successHandler({
      res,
      statusCode,
      message: "Got New Credentials",
      body: newTokens,
    });
  };
}

export default new UserService();
