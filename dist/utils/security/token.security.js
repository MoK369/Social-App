import jwt from "jsonwebtoken";
import { SignatureLevelsEnum, TokenTypesEnum, UserRoleEnum, } from "../constants/enum.constants.js";
import { BadRequestException, UnauthorizedException, } from "../exceptions/custom.exceptions.js";
import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
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
        return {
            accessToken: this.generate({
                payload: { id: user.id },
                secret: signatures.accessSignature,
            }),
            refreshToken: this.generate({
                payload: { id: user.id },
                secret: signatures.refreshSignatrue,
                options: {
                    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
                },
            }),
        };
    };
    static decode = async ({ authorization, tokenType = TokenTypesEnum.access, }) => {
        const userRepository = new UserRepository(UserModel);
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
        if (!payload.id || !payload.iat) {
            throw new BadRequestException("Invalid Token Payload !");
        }
        const user = await userRepository.findById({ id: payload.id });
        if (!user?.confirmedAt) {
            throw new BadRequestException("Invalid Account!");
        }
        return {
            user,
            payload,
        };
    };
}
export default Token;
