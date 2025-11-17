import jwt from "jsonwebtoken";
import { LogoutStatusEnum, SignatureLevelsEnum, TokenTypesEnum, UserRoleEnum, } from "../constants/enum.constants.js";
import { BadRequestException, ServerException, UnauthorizedException, } from "../exceptions/custom.exceptions.js";
import UserRepository from "../../db/repository/user.respository.js";
import { UserModel } from "../../db/models/user.model.js";
import { generateAlphaNumaricId } from "./id.security.js";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.js";
import RevokedTokenModel from "../../db/models/revoked_token.model.js";
class Token {
    static _userRepository = new UserRepository(UserModel);
    static _revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
    static generate = ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    }, }) => {
        return jwt.sign(payload, secret, options);
    };
    static verifiy = ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = {}, }) => {
        return jwt.verify(token, secret, options);
    };
    static getSignatureLevel = ({ role, }) => {
        switch (role) {
            case UserRoleEnum.ADMIN:
                return SignatureLevelsEnum.System;
            default:
                return SignatureLevelsEnum.Bearer;
        }
    };
    static getSignatures = ({ signatureLevel, }) => {
        switch (signatureLevel) {
            case SignatureLevelsEnum.System:
                return {
                    accessSignature: process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE,
                    refreshSignatrue: process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE,
                };
            default:
                return {
                    accessSignature: process.env.ACCESS_USER_TOKEN_SIGNATURE,
                    refreshSignatrue: process.env.REFRESH_USER_TOKEN_SIGNATURE,
                };
        }
    };
    static getTokensBasedOnRole = ({ user, }) => {
        const signatures = this.getSignatures({
            signatureLevel: this.getSignatureLevel({ role: user.role }),
        });
        const jti = generateAlphaNumaricId();
        return {
            accessToken: this.generate({
                payload: { id: user.id, jti },
                secret: signatures.accessSignature,
            }),
            refreshToken: this.generate({
                payload: { id: user.id, jti },
                secret: signatures.refreshSignatrue,
                options: {
                    expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                },
            }),
        };
    };
    static decode = async ({ authorization, tokenType = TokenTypesEnum.access, }) => {
        const [bearer, token] = authorization.split(" ");
        if (!bearer || !token) {
            throw new UnauthorizedException("Missing Token Parts ⛔");
        }
        if (!Object.values(SignatureLevelsEnum).includes(bearer)) {
            throw new BadRequestException("Invalid Bearer Key!");
        }
        const signatures = this.getSignatures({
            signatureLevel: bearer,
        });
        const payload = this.verifiy({
            token,
            secret: tokenType === TokenTypesEnum.refresh
                ? signatures.refreshSignatrue
                : signatures.accessSignature,
        });
        if (!payload.id || !payload.iat || !payload.jti) {
            throw new BadRequestException("Invalid Token Payload !");
        }
        if (await this._revokedTokenRepository.findOne({
            filter: { jti: payload.jti },
        })) {
            throw new BadRequestException("Token as been Revoked!");
        }
        const user = await this._userRepository.findOne({
            filter: { _id: payload.id },
        });
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
    static revoke = async ({ flag = LogoutStatusEnum.one, userId, tokenPayload, }) => {
        let statusCode = 200;
        switch (flag) {
            case LogoutStatusEnum.all:
                await this._userRepository
                    .updateOne({
                    filter: { _id: userId },
                    update: {
                        changeCredentialsTime: Date.now(),
                    },
                })
                    .catch((err) => {
                    throw new ServerException("Failed to revoke Tokens!");
                });
                break;
            default:
                await this._revokedTokenRepository
                    .create({
                    data: [
                        {
                            jti: tokenPayload.jti,
                            expiresIn: tokenPayload.iat +
                                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                            userId,
                        },
                    ],
                })
                    .catch((err) => {
                    throw new ServerException("Failed to revoke Token!");
                });
                statusCode = 201;
                break;
        }
        return statusCode;
    };
}
export default Token;
