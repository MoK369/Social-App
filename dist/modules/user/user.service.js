import UserModel from "../../db/models/user.model.js";
import UserRepository from "../../db/repository/user.respository.js";
import successHandler from "../../utils/handlers/success.handler.js";
import RevokedTokenModel from "../../db/models/revoked_token.model.js";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.js";
import Token from "../../utils/security/token.security.js";
import S3Service from "../../utils/multer/s3.config.js";
class UserService {
    userRepository = new UserRepository(UserModel);
    revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
    profile = async (req, res) => {
        return successHandler({ res, message: "User Profile!", body: req.user });
    };
    profileImage = async (req, res) => {
        const uploadKey = await S3Service.uploadFile({
            File: req.file,
            Path: `users/${req.tokenPayload?.id}`,
        });
        return successHandler({
            res,
            message: "Image Uploaded !",
            body: { path: uploadKey },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.validationResult.body;
        const statusCode = await Token.revoke({
            flag,
            userId: req.user._id,
            tokenPayload: req.tokenPayload,
        });
        return successHandler({
            res,
            statusCode,
            message: `Logged out ${flag} Successfully!`,
        });
    };
    refreshToken = async (req, res) => {
        const newTokens = Token.getTokensBasedOnRole({ user: req.user });
        const statusCode = await Token.revoke({
            userId: req.user._id,
            tokenPayload: req.tokenPayload,
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
