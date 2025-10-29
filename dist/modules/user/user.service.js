import UserModel from "../../db/models/user.model.js";
import UserRepository from "../../db/repository/user.respository.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { LogoutStatusEnum } from "../../utils/constants/enum.constants.js";
import RevokedTokenModel from "../../db/models/revoked_token.model.js";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.js";
class UserService {
    userRepository = new UserRepository(UserModel);
    revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
    profile = async (req, res) => {
        return successHandler({ res, message: "User Profile!", body: req.user });
    };
    logout = async (req, res) => {
        const { flag } = req.validationResult.body;
        let statusCode = 200;
        let toUpdate = {};
        switch (flag) {
            case LogoutStatusEnum.all:
                toUpdate.changeCredentialsTime = Date.now();
                await this.userRepository.updateOne({
                    filter: { _id: req.user?._id },
                    update: toUpdate,
                });
                break;
            default:
                await this.revokedTokenRepository.create({
                    data: [
                        {
                            jti: req.tokenPayload.jti,
                            expiresIn: req.tokenPayload.iat +
                                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                            userId: req.user._id,
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
