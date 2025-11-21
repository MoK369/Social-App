import successHandler from "../../utils/handlers/success.handler.js";
import { UserRepository, PostRepository, CommentRepository, } from "../../db/repository/index.js";
import { UserModel, PostModel, CommentModel } from "../../db/models/index.js";
import { BadRequestException, ForbiddenException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import { generateAlphaNumaricId } from "../../utils/security/id.security.js";
import S3Service from "../../utils/multer/s3.service.js";
import { Types } from "mongoose";
import { AllowCommentsEnum, AvailabilityEnum, LikeActionsEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.js";
import { connectedSockets, io } from "../gateway/gateway.js";
class PostService {
    _postRepository = new PostRepository(PostModel);
    _userRepository = new UserRepository(UserModel);
    _commentRepository = new CommentRepository(CommentModel);
    createPost = async (req, res) => {
        const { content, attachments, allowComments, availability, tags } = req
            .validationResult.body;
        if (availability === AvailabilityEnum.onlyMe && tags?.length) {
            throw new BadRequestException("tags are not allowed with onlyMe posts");
        }
        if (tags?.length && tags.includes(req.user._id.toString())) {
            throw new BadRequestException("You can not mention yourself in the post");
        }
        if (tags?.length &&
            (await this._userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            })).length !== tags.length) {
            throw new NotFoundException("Some of tagged users are not found");
        }
        let attachmentsSubKeys = [];
        const assetsFolderId = generateAlphaNumaricId();
        if (attachments?.length) {
            attachmentsSubKeys = await S3Service.uploadFiles({
                Files: attachments,
                Path: `users/${req.tokenPayload?.id}/posts/${assetsFolderId}`,
            });
        }
        await this._postRepository
            .create({
            data: [
                {
                    content,
                    attachments: attachmentsSubKeys,
                    assetsFolderId,
                    createdBy: req.user._id,
                    allowComments,
                    availability,
                    tags: tags?.map((tag) => Types.ObjectId.createFromHexString(tag)),
                },
            ],
        })
            .catch(async () => {
            if (attachments?.length) {
                await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
            }
            throw new BadRequestException("Failed to create the post, try again later");
        });
        return successHandler({
            res,
            statusCode: 201,
            message: "Post created successfull!",
        });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.validationResult.query;
        const toUpdateObject = action === LikeActionsEnum.like
            ? { $addToSet: { likes: req.user._id } }
            : { $pull: { likes: req.user._id } };
        const post = await this._postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: postFilterBasedOnAvailability(req),
            },
            update: toUpdateObject,
        });
        if (!post) {
            throw new NotFoundException("invalid postId, invalid user account, or post doens't exit");
        }
        if (action !== LikeActionsEnum.unlike) {
            io.to(connectedSockets.get(post.createdBy.toString()) || []).emit("likePost", {
                postId,
                userId: req.user._id,
            });
        }
        return successHandler({ res });
    };
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const { content, attachments = [], allowComments, availability, tags = [], removedAttachments = [], removedTags = [], } = req.body;
        const post = await this._postRepository.findOne({
            filter: {
                _id: postId,
                createdBy: req.user._id,
            },
        });
        if (!post)
            throw new NotFoundException("post not Found");
        if (availability === AvailabilityEnum.onlyMe && tags?.length) {
            throw new BadRequestException("tags are not allowed with onlyMe posts");
        }
        if (tags?.length && tags.includes(req.user._id.toString())) {
            throw new BadRequestException("You can not mention yourself in the post");
        }
        if (tags?.length &&
            (await this._userRepository.find({
                filter: {
                    _id: { $in: tags },
                },
            })).length !== tags.length) {
            throw new NotFoundException("Some of tagged users are not found");
        }
        let attachmentsSubKeys = [];
        if (attachments?.length) {
            attachmentsSubKeys = await S3Service.uploadFiles({
                Files: attachments,
                Path: `users/${post.createdBy}/posts/${post.assetsFolderId}`,
            });
        }
        const toUpdate = {};
        if (content?.length)
            toUpdate.content = content;
        if (allowComments)
            toUpdate.allowComments = allowComments;
        if (availability)
            toUpdate.availability = availability;
        const updateResult = await this._postRepository.updateById({
            id: postId,
            update: [
                {
                    $set: {
                        ...toUpdate,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: ["$attachments", removedAttachments],
                                },
                                attachmentsSubKeys,
                            ],
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$tags",
                                        removedTags.map((tag) => Types.ObjectId.createFromHexString(tag)),
                                    ],
                                },
                                tags.map((tag) => Types.ObjectId.createFromHexString(tag)),
                            ],
                        },
                    },
                },
            ],
        });
        if (!updateResult.matchedCount) {
            if (attachments?.length) {
                await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
            }
            throw new BadRequestException("Failed to update the post, try again later");
        }
        else {
            if (removedAttachments?.length) {
                await S3Service.deleteFiles({ SubKeys: removedAttachments });
            }
        }
        return successHandler({ res });
    };
    getPostList = async (req, res) => {
        const { page = 1, size = 5 } = req.query;
        const paginationResult = await this._postRepository.paginate({
            filter: {
                $or: postFilterBasedOnAvailability(req),
            },
            options: {
                populate: [
                    {
                        path: "comments",
                        match: {
                            commentId: { $exists: false },
                            freezed: { $exists: false },
                        },
                        populate: [
                            {
                                path: "reply",
                                match: {
                                    commentId: { $exists: true },
                                    freezed: { $exists: false },
                                },
                                populate: [
                                    {
                                        path: "reply",
                                        match: {
                                            commentId: { $exists: true },
                                            freezed: { $exists: false },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            page,
            size,
        });
        return successHandler({
            res,
            body: paginationResult,
        });
    };
    freezePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postRepository.findOne({
            filter: {
                _id: postId,
            },
        });
        if (!post) {
            throw new NotFoundException("Invalid postId or already freezed");
        }
        if (req.user.role === UserRoleEnum.USER &&
            !post.createdBy.equals(req.user._id)) {
            throw new ForbiddenException("Not authorized to freeze this post");
        }
        await post.updateOne({ freezed: { at: new Date(), by: req.user._id } });
        return successHandler({ res, message: "Post Freezed Successfully!" });
    };
    deletePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postRepository.findOne({
            filter: {
                _id: postId,
                paranoid: false,
                freezed: { $exists: true },
            },
            options: {
                populate: [
                    {
                        path: "freezed.by",
                        select: "role",
                    },
                ],
            },
        });
        console.log(post);
        if (!post) {
            throw new NotFoundException("Invalid postId or not freezed");
        }
        const freezedBy = post.freezed.by;
        if ((req.user.role === UserRoleEnum.USER &&
            !freezedBy._id.equals(req.user._id)) ||
            (req.user.role !== UserRoleEnum.SUPERADMIN &&
                freezedBy.role === UserRoleEnum.SUPERADMIN)) {
            throw new ForbiddenException("Not authorized to delete this post");
        }
        await post.deleteOne();
        await this._commentRepository.deleteMany({
            filter: {
                postId: post._id,
            },
        });
        if (post.attachments?.length) {
            await S3Service.deleteFolderByPrefix({
                FolderPath: `users/${post.createdBy}/posts/${post.assetsFolderId}`,
            });
        }
        return successHandler({ res, message: "Post Deleted Successfully!" });
    };
}
export default PostService;
