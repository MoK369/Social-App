import type { Request, Response } from "express";
import UserModel from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import type { LogoutBodyTypeDto } from "./user.dto.ts";
import { LogoutStatusEnum } from "../../utils/constants/enum.constants.ts";
import type { IUser } from "../../db/interfaces/user.interface.ts";
import type { UpdateQuery } from "mongoose";
import RevokedTokenModel from "../../db/models/revoked_token.model.ts";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.ts";

class UserService {
  protected userRepository = new UserRepository(UserModel);
  protected revokedTokenRepository = new RevokedTokenRepository(
    RevokedTokenModel
  );

  profile = async (req: Request, res: Response): Promise<Response> => {
    return successHandler({ res, message: "User Profile!", body: req.user! });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutBodyTypeDto = req.validationResult.body;

    let statusCode = 200;
    let toUpdate: UpdateQuery<IUser> = {};
    switch (flag) {
      case LogoutStatusEnum.all:
        toUpdate.changeCredentialsTime = Date.now();
        await this.userRepository.updateOne({
          filter: { _id: req.user?._id! },
          update: toUpdate,
        });
        break;
      default:
        await this.revokedTokenRepository.create({
          data: [
            {
              jti: req.tokenPayload!.jti!,
              expiresIn:
                req.tokenPayload!.iat! +
                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
              userId: req.user!._id!,
            },
          ],
        });
        statusCode = 201;
        break;
    }
    return successHandler({
      res,
      statusCode,
      message: `Logged out ${flag} Successfully!`,
    });
  };
}

export default new UserService();
