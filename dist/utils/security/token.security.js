import jwt from "jsonwebtoken";
import { SignatureLevelsEnum, TokenTypesEnum, UserRoleEnum, } from "../constants/enum.constants.js";
import { BadRequestException, UnauthorizedException, } from "../exceptions/custom.exceptions.js";
import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
import { generate21CharactersId } from "./id.security.js";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.js";
import RevokedTokenModel from "../../db/models/revoked_token.model.js";
class Token {
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
        const jti = generate21CharactersId();
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
    static decode = async ({ authorization, tokenType = TokenTypesEnum.access, }) => {
        const userRepository = new UserRepository(UserModel);
        const revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
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
        if (await revokedTokenRepository.findOne({
            filter: { jti: payload.jti },
        })) {
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
