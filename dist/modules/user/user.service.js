import UserModel from "../../db/models/user.model.js";
import UserRepository from "../../db/repository/user.respository.js";
import successHandler from "../../utils/handlers/success.handler.js";
import RevokedTokenModel from "../../db/models/revoked_token.model.js";
import RevokedTokenRepository from "../../db/repository/revoked_token.repository.js";
import Token from "../../utils/security/token.security.js";
import S3Service from "../../utils/multer/s3.service.js";
import KeyUtil from "../../utils/multer/key.multer.js";
import s3Events from "../../utils/events/s3.events.js";
import { S3EventsEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import { BadRequestException, ForbiddenException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
class UserService {
    userRepository = new UserRepository(UserModel);
    revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
    profile = async (req, res) => {
        const user = req.user.toJSON();
        if (user.profilePicture?.subKey) {
            user.profilePicture.url = KeyUtil.generateS3UploadsUrlFromSubKey({
                req,
                subKey: user.profilePicture.subKey || "",
            });
            user.profilePicture.subKey = undefined;
        }
        return successHandler({ res, message: "User Profile!", body: user });
    };
    profileImage = async (req, res) => {
        const uploadSubKey = await S3Service.uploadFile({
            File: req.file,
            Path: `users/${req.tokenPayload?.id}/profile`,
        });
        const { subKey } = req.user?.profilePicture || {};
        if (subKey) {
            await S3Service.deleteFile({
                SubKey: subKey,
            });
        }
        await this.userRepository.updateOne({
            filter: { _id: req.user._id },
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
    profileImageWithPresignedUrl = async (req, res) => {
        const { contentType, originalname, } = req.body;
        const { url, key } = await S3Service.createPresignedUploadUrl({
            contentType,
            originalname,
            Path: `users/${req.tokenPayload?.id}/profile`,
        });
        const user = await this.userRepository.findByIdAndUpdate({
            id: req.user._id,
            update: {
                profilePicture: { subKey: key },
                tempProfilePicture: { subKey: req.user.profilePicture?.subKey },
            },
            options: {
                new: true,
                projection: { profilePicture: 1 },
            },
        });
        if (!user) {
            throw new BadRequestException("Invalid account");
        }
        s3Events.publish({
            eventName: S3EventsEnum.trackProfileImageUpload,
            payload: {
                userId: user._id,
                oldSubKey: req.user.profilePicture?.subKey,
                newSubKey: key,
            },
        });
        return successHandler({
            res,
            message: "Image Uploaded !",
            body: { url, user },
        });
    };
    profileCoverImages = async (req, res) => {
        const uploadSubKeys = await S3Service.uploadFiles({
            Files: req.files,
            Path: `users/${req.tokenPayload?.id}/profile/covers`,
        });
        if (req.user.coverImages && req.user.coverImages.length > 0) {
            await S3Service.deleteFiles({ SubKeys: req.user.coverImages });
        }
        const user = await this.userRepository.findByIdAndUpdate({
            id: req.user._id,
            update: {
                coverImages: uploadSubKeys,
            },
            options: {
                new: true,
                projection: { coverImages: 1 },
            },
        });
        return successHandler({
            res,
            message: "Cover Images Uploaded Successfully!",
            body: {
                coverImages: user?.coverImages.map((subKey) => KeyUtil.generateS3UploadsUrlFromSubKey({ req, subKey })),
            },
        });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params;
        if (userId && req.user.role !== UserRoleEnum.ADMIN) {
            throw new ForbiddenException("Not Authorized User");
        }
        const result = await this.userRepository.updateOne({
            filter: {
                _id: userId || req.user._id,
                freezed: { $exists: false },
            },
            update: {
                freezed: {
                    at: new Date(),
                    by: req.user._id,
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
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const result = await this.userRepository.updateOne({
            filter: {
                _id: userId,
                freezed: { $exists: true },
                "freezed.by": { $ne: userId },
            },
            update: {
                restored: {
                    at: new Date(),
                    by: req.user._id,
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
    hardDeleteAccount = async (req, res) => {
        const { userId } = req.params;
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
