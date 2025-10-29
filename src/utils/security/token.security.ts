import jwt from "jsonwebtoken";
import type { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import type { HIUser } from "../../db/interfaces/user.interface.ts";
import {
  SignatureLevelsEnum,
  TokenTypesEnum,
  UserRoleEnum,
} from "../constants/enum.constants.js";
import {
  BadRequestException,
  UnauthorizedException,
} from "../exceptions/custom.exceptions.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import type { ITokenPayload } from "../constants/interface.constants.ts";
import { generate21CharactersId } from "./id.security.ts";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.ts";
import RevokedTokenModel from "../../db/models/revoked_token.model.ts";

class Token {
  static generate = ({
    payload,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: ITokenPayload;
    secret?: Secret;
    options?: SignOptions;
  }): string => {
    return jwt.sign(payload, secret, options);
  };

  static verifiy = ({
    token,
    secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    options = {},
  }: {
    token: string;
    secret?: Secret;
    options?: VerifyOptions;
  }): ITokenPayload => {
    return jwt.verify(token, secret, options) as ITokenPayload;
  };

  static getSignatureLevel = ({
    role,
  }: {
    role: UserRoleEnum;
  }): SignatureLevelsEnum => {
    switch (role) {
      case UserRoleEnum.ADMIN:
        return SignatureLevelsEnum.System;

      default:
        return SignatureLevelsEnum.Bearer;
    }
  };

  static getSignatures = ({
    signatureLevel,
  }: {
    signatureLevel: SignatureLevelsEnum;
  }): { accessSignature: string; refreshSignatrue: string } => {
    switch (signatureLevel) {
      case SignatureLevelsEnum.System:
        return {
          accessSignature: process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE!,
          refreshSignatrue: process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE!,
        };

      default:
        return {
          accessSignature: process.env.ACCESS_USER_TOKEN_SIGNATURE!,
          refreshSignatrue: process.env.REFRESH_USER_TOKEN_SIGNATURE!,
        };
    }
  };

  static getTokensBasedOnRole = ({
    user,
  }: {
    user: HIUser;
  }): { accessToken: string; refreshToken: string } => {
    const signatures = this.getSignatures({
      signatureLevel: this.getSignatureLevel({ role: user.role }),
    });
    const jti: string = generate21CharactersId(); // jti = jwtId
    return {
      accessToken: this.generate({
        payload: { id: user.id, jti },
        secret: signatures.accessSignature,
      }),
      refreshToken: this.generate({
        payload: { id: user.id, jti },
        secret: signatures.refreshSignatrue,
        options: {
          expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        },
      }),
    };
  };

  static decode = async ({
    authorization,
    tokenType = TokenTypesEnum.access,
  }: {
    authorization: string;
    tokenType?: TokenTypesEnum;
  }): Promise<{ user: HIUser; payload: ITokenPayload }> => {
    const userRepository = new UserRepository(UserModel);
    const revokedTokenRepository = new RevokedTokenRepository(
      RevokedTokenModel
    );
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token) {
      throw new UnauthorizedException("Missing Token Parts ⛔");
    }

    if (
      !Object.values(SignatureLevelsEnum).includes(
        bearer as SignatureLevelsEnum
      )
    ) {
      throw new BadRequestException("Invalid Bearer Key!");
    }

    const signatures = this.getSignatures({
      signatureLevel: bearer as SignatureLevelsEnum,
    });

    const payload = this.verifiy({
      token,
      secret:
        tokenType === TokenTypesEnum.refresh
          ? signatures.refreshSignatrue
          : signatures.accessSignature,
    });
    if (!payload.id || !payload.iat || !payload.jti) {
      throw new BadRequestException("Invalid Token Payload !");
    }

    if (
      await revokedTokenRepository.findOne({
        filter: { jti: payload.jti! },
      })
    ) {
      throw new BadRequestException("Token as been Revoked!");
    }

    const user = await userRepository.findById({ id: payload.id });
    if (!user?.confirmedAt) {
      throw new BadRequestException("Invalid Account!");
    }

    if ((user?.changeCredentialsTime?.getTime() || 0) > payload.iat * 1000) {
      throw new BadRequestException("Token as been Revoked!");
    }

    return {
      user,
      payload,
    };
  };
}

export default Token;
