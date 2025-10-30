import type { Request, Response } from "express";
import UserModel from "../../db/models/user.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import type { LogoutBodyTypeDto } from "./user.dto.ts";
import RevokedTokenModel from "../../db/models/revoked_token.model.ts";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.ts";
import Token from "../../utils/security/token.security.ts";

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
