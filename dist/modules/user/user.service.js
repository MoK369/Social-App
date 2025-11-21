import { UserModel, userSchema, RevokedTokenModel, FriendRequestModel, PostModel, ChatModel, CommentModel, } from "../../db/models/index.js";
import { UserRepository, FriendRequestRepository, RevokedTokenRepository, PostRepository, ChatRespository, CommentRepository, } from "../../db/repository/index.js";
import successHandler from "../../utils/handlers/success.handler.js";
import Token from "../../utils/security/token.security.js";
import S3Service from "../../utils/multer/s3.service.js";
import KeyUtil from "../../utils/multer/key.multer.js";
import s3Events from "../../utils/events/s3.events.js";
import { EmailEventsEnum, EmailStatusEnum, OTPTypesEnum, S3EventsEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import OTP from "../../utils/security/otp.security.js";
import { generateNumericId } from "../../utils/security/id.security.js";
import Hashing from "../../utils/security/hash.security.js";
import emailEvent from "../../utils/events/email.event.js";
import mongoose, { Types } from "mongoose";
class UserService {
    _userRepository = new UserRepository(UserModel);
    _chatRepository = new ChatRespository(ChatModel);
    _postRepository = new PostRepository(PostModel);
    _commentRepository = new CommentRepository(CommentModel);
    _revokedTokenRepository = new RevokedTokenRepository(RevokedTokenModel);
    _friendRequestRepository = new FriendRequestRepository(FriendRequestModel);
    enableTwoFactor = async (req, res) => {
        const count = OTP.checkRequestOfNewOTP({
            user: req.user,
            otpType: OTPTypesEnum.enableTwoFactor,
            checkEmailStatus: EmailStatusEnum.confirmed,
        });
        const otp = generateNumericId();
        await this._userRepository.updateOne({
            filter: { _id: req.user._id },
            update: {
                twoFactorOtp: {
                    expiresAt: Date.now() + 10 * 60 * 1000,
                    code: await Hashing.generateHash({
                        plainText: otp,
                    }),
                    count,
                },
            },
        });
        emailEvent.publish({
            eventName: EmailEventsEnum.enableTwoFactor,
            payload: { otp, to: req.user.email },
        });
        return successHandler({ res, message: "Enable 2FA OTP has been sent!" });
    };
    confirmTwoFactor = async (req, res) => {
        const { otp } = req.body;
        if (req.user.twoFactorEnabledAt) {
            throw new BadRequestException("2FA is already enabled");
        }
        if (!req.user.twoFactorOtp || !req.user.twoFactorOtp.code) {
            throw new BadRequestException("Please request an OTP to enable 2FA");
        }
        if (Date.now() >= req.user.twoFactorOtp.expiresAt.getTime() ||
            !(await Hashing.compareHash({
                plainText: otp,
                cipherText: req.user.twoFactorOtp.code,
            }))) {
            throw new BadRequestException("Invalid OTP or Has Expired!");
        }
        await this._userRepository.updateById({
            id: req.user._id,
            update: {
                twoFactorEnabledAt: new Date(),
                $unset: { twoFactorOtp: true },
            },
        });
        return successHandler({
            res,
            message: "2FA has been Enabled Successfully",
        });
    };
    profile = async (req, res) => {
        const user = await this._userRepository.findById({
            id: req.user._id,
            options: {
                populate: [
                    {
                        path: "friends",
                        select: "firstName lastName fullName email profilePicture",
                    },
                ],
            },
        });
        const groups = (await this._chatRepository.find({
            filter: {
                participants: { $in: [req.user._id] },
                groupName: { $exists: true },
            },
        })) || [];
        return successHandler({
            res,
            message: "User Profile!",
            body: {
                user: user,
                groups,
            },
        });
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
        await this._userRepository.updateOne({
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
        const user = await this._userRepository.findByIdAndUpdate({
            id: req.user._id,
            update: {
                profilePicture: { subKey: key },
                tempProfilePicture: { subKey: req.user.profilePicture?.subKey },
            },
            options: {
                new: true,
                projection: { profilePicture: 1 },
                lean: {
                    transform: (doc, ret) => {
                        const fn = userSchema.get("toObject").transform;
                        if (typeof fn === "function")
                            return fn(ret, doc, {});
                    },
                },
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
            body: { url, profilePicture: user?.profilePicture },
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
        const user = await this._userRepository.findByIdAndUpdate({
            id: req.user._id,
            update: {
                coverImages: uploadSubKeys,
            },
            options: {
                new: true,
                lean: {
                    transform: (doc, ret) => {
                        const fn = userSchema.get("toObject").transform;
                        if (typeof fn === "function")
                            return fn(ret, doc, {});
                    },
                },
                projection: { coverImages: 1 },
            },
        });
        return successHandler({
            res,
            message: "Cover Images Uploaded Successfully!",
            body: {
                coverImages: user?.coverImages || [],
            },
        });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params;
        if (userId && req.user.role === UserRoleEnum.USER) {
            throw new ForbiddenException("Not Authorized User");
        }
        const result = await this._userRepository.updateOne({
            filter: {
                _id: userId || req.user._id,
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
        if (!result.modifiedCount) {
            throw new NotFoundException("user not found or already freezed");
        }
        return successHandler({ res, message: "Account Freezed!" });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const result = await this._userRepository.updateOne({
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
        const result = await this._userRepository.deleteOne({
            filter: {
                _id: userId,
                freezed: { $exists: true },
            },
        });
        if (!result.deletedCount) {
            throw new NotFoundException("invalid user account or already deleted");
        }
        await Promise.all([
            this._userRepository.updateMany({
                filter: {
                    friends: { $in: [userId] },
                },
                update: {
                    $pull: { friends: userId },
                },
            }),
            this._postRepository.deleteMany({
                filter: {
                    createdBy: userId,
                },
            }),
            this._commentRepository.deleteMany({
                filter: {
                    createdBy: userId,
                },
            }),
            S3Service.deleteFolderByPrefix({ FolderPath: `users/${userId}` }),
        ]);
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
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        if (req.user._id.equals(userId)) {
            throw new ConflictException("Can't send friend request to yourself");
        }
        const checkFriendRequestExists = await this._friendRequestRepository.findOne({
            filter: {
                createdBy: { $in: [req.user._id, userId] },
                sentTo: { $in: [req.user._id, userId] },
            },
        });
        if (checkFriendRequestExists) {
            throw new ConflictException("Friend request already exists 🙂");
        }
        const user = await this._userRepository.findOne({
            filter: {
                _id: userId,
                freezed: { $exists: false },
            },
        });
        if (!user) {
            throw new BadRequestException("Invalid recipient 🚫");
        }
        await this._friendRequestRepository.create({
            data: [
                {
                    createdBy: req.user._id,
                    sentTo: new mongoose.Types.ObjectId(userId),
                },
            ],
        });
        return successHandler({
            res,
            statusCode: 201,
            message: "Friend Request Sent Successfully 👍",
        });
    };
    acceptFriendRequest = async (req, res) => {
        const { friendRequestId } = req.params;
        const friendRequest = await this._friendRequestRepository.findOneAndUpdate({
            filter: {
                _id: friendRequestId,
                sentTo: req.user._id,
                acceptedAt: { $exists: false },
            },
            update: {
                acceptedAt: new Date(),
            },
        });
        if (!friendRequest) {
            throw new NotFoundException("Friend request doesn't exist or already accepted ");
        }
        await Promise.all([
            this._userRepository.updateById({
                id: friendRequest.createdBy,
                update: {
                    $addToSet: { friends: friendRequest.sentTo },
                },
            }),
            this._userRepository.updateById({
                id: friendRequest.sentTo,
                update: {
                    $addToSet: { friends: friendRequest.createdBy },
                },
            }),
        ]);
        return successHandler({ res });
    };
    rejectFriendRequest = async (req, res) => {
        const { friendRequestId } = req.params;
        const friendRequest = await this._friendRequestRepository.findOneAndDelete({
            filter: {
                _id: friendRequestId,
                sentTo: req.user._id,
                acceptedAt: { $exists: false },
            },
        });
        if (!friendRequest) {
            throw new NotFoundException("Failed to reject, friend request doesn't exist or already accepted");
        }
        return successHandler({ res });
    };
    unfriend = async (req, res) => {
        const { friendId } = req.params;
        const friendIdObject = Types.ObjectId.createFromHexString(friendId);
        const friend = await this._userRepository.findOne({
            filter: { _id: friendId },
        });
        if (!friend) {
            throw new NotFoundException("Invalid friendId");
        }
        if (!req.user.friends.includes(friendIdObject)) {
            throw new NotFoundException("Frienship doesn't exist");
        }
        await Promise.all([
            friend.updateOne({ $pull: { friends: req.user._id } }),
            req.user.updateOne({ $pull: { friends: friendIdObject } }),
            this._friendRequestRepository.deleteOne({
                filter: {
                    $or: [
                        { createdBy: req.user._id, sendTo: friendId },
                        { sentTo: req.user._id, createdBy: friendId },
                    ],
                },
            }),
        ]);
        emailEvent.publish({
            eventName: EmailEventsEnum.unfriendNotifyingEmail,
            payload: {
                to: friend.email,
                removingFriendshipUser: req.user.fullName,
            },
        });
        return successHandler({ res, message: "Friendship has been deleted" });
    };
    dashboard = async (req, res) => {
        const [users, posts] = await Promise.allSettled([
            this._userRepository.find(),
            this._postRepository.find(),
        ]);
        return successHandler({ res, body: { users, posts } });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        const denyRoles = [role, UserRoleEnum.SUPERADMIN];
        if (req.user.role === UserRoleEnum.ADMIN) {
            if (role === UserRoleEnum.SUPERADMIN) {
                throw new ForbiddenException("You don't have the privilage to make a user Super Admin");
            }
            denyRoles.push(UserRoleEnum.ADMIN);
        }
        const user = await this._userRepository.findOneAndUpdate({
            filter: { _id: userId, role: { $nin: denyRoles } },
            update: {
                role,
            },
        });
        if (!user) {
            throw new NotFoundException("Invalid userId or userId not found");
        }
        return successHandler({ res });
    };
}
export default new UserService();
