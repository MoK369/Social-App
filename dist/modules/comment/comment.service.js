import successHandler from "../../utils/handlers/success.handler.js";
import { CommentRepository, PostRepository, UserRepository, } from "../../db/repository/index.js";
import { CommentModel, PostModel, UserModel } from "../../db/models/index.js";
import S3Service from "../../utils/multer/s3.service.js";
import { BadRequestException, ForbiddenException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import { AllowCommentsEnum, UserRoleEnum, } from "../../utils/constants/enum.constants.js";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.js";
import { Types } from "mongoose";
class CommentService {
    _userRepository = new UserRepository(UserModel);
    _postRepository = new PostRepository(PostModel);
    _commentRepository = new CommentRepository(CommentModel);
    createComment = async (req, res) => {
        const { postId } = req.params;
        const { content, attachments, tags } = req.validationResult
            .body;
        const post = await this._postRepository.findOne({
            filter: {
                _id: postId,
                allowComments: AllowCommentsEnum.allow,
                $or: postFilterBasedOnAvailability(req),
            },
            options: {
                populate: [{ path: "createdBy", select: "email" }],
            },
        });
        if (!post || post.createdBy === null) {
            throw new NotFoundException("Invalid postId or post doesn't exist");
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
                Path: `users/${post.createdBy._id}/posts/${post.assetsFolderId}/comments`,
            });
        }
        await this._commentRepository
            .create({
            data: [
                {
                    postId: Types.ObjectId.createFromHexString(postId),
                    content,
                    attachments: attachmentsSubKeys,
                    createdBy: req.user._id,
                    tags: tags?.map((tag) => Types.ObjectId.createFromHexString(tag)),
                },
            ],
        })
            .catch(async () => {
            if (attachments?.length) {
                await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
            }
            throw new BadRequestException("Failed to create the comment, try again later");
        });
        return successHandler({
            res,
            statusCode: 201,
            message: "Comment created successfully!",
        });
    };
    getCommentById = async (req, res) => {
        const { commentId } = req.params;
        const comment = await this._commentRepository.findOne({
            filter: {
                _id: commentId,
                createdBy: req.user._id,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        select: "createdBy",
                        populate: [
                            {
                                path: "createdBy",
                                select: "email",
                                transform(doc, id) {
                                    return doc.toJSON();
                                },
                            },
                        ],
                        transform(doc, id) {
                            return doc.toJSON();
                        },
                    },
                    {
                        path: "reply",
                        populate: [
                            {
                                path: "reply",
                            },
                        ],
                    },
                ],
            },
        });
        if (!comment) {
            throw new NotFoundException("Invalid commentId, or comment doesn't exist");
        }
        if (comment.postId === null ||
            comment.postId.createdBy ===
                null) {
            throw new NotFoundException("post of this comment is not found");
        }
        return successHandler({ res, body: { comment } });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const { content, attachments, tags } = req.validationResult
            .body;
        const comment = await this._commentRepository.findOne({
            filter: {
                _id: commentId,
                postId,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        select: "createdBy",
                        match: {
                            allowComments: AllowCommentsEnum.allow,
                            $or: postFilterBasedOnAvailability(req),
                        },
                        populate: [{ path: "createdBy", select: "email" }],
                    },
                ],
            },
        });
        console.log({ comment });
        if (!comment?.postId ||
            comment.postId.createdBy === null) {
            throw new NotFoundException("Invalid commentId, comment doesn't exist or post doesn't exit");
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
            const post = comment.postId;
            attachmentsSubKeys = await S3Service.uploadFiles({
                Files: attachments,
                Path: `users/${post.createdBy._id}/posts/${post.assetsFolderId}/comments`,
            });
        }
        console.log({ attachmentsSubKeys });
        await this._commentRepository
            .create({
            data: [
                {
                    postId: Types.ObjectId.createFromHexString(postId),
                    commentId: Types.ObjectId.createFromHexString(commentId),
                    content,
                    attachments: attachmentsSubKeys,
                    createdBy: req.user._id,
                    tags: tags?.map((tag) => Types.ObjectId.createFromHexString(tag)),
                },
            ],
        })
            .catch(async () => {
            if (attachments?.length) {
                await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
            }
            throw new BadRequestException("Failed to create the reply comment, try again later");
        });
        return successHandler({
            res,
            statusCode: 201,
            message: "Reply comment created successfully!",
        });
    };
    updateComment = async (req, res) => {
        const { commentId } = req.params;
        const { content, attachments = [], tags = [], removedAttachments = [], removedTags = [], } = req.body;
        const comment = await this._commentRepository.findOne({
            filter: {
                _id: commentId,
                createdBy: req.user._id,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        select: "assetsFolderId createdBy",
                    },
                    {
                        path: "commentId",
                        select: "createdBy",
                    },
                ],
            },
        });
        console.log({ comment });
        console.log({ commntId: comment?.commentId });
        console.log({
            commntId: comment?.commentId === null,
        });
        if (!comment)
            throw new NotFoundException("comment not Found");
        if (comment.commentId === null) {
            throw new NotFoundException("comment of this reply is not found");
        }
        if (comment.postId === null) {
            throw new NotFoundException("post of this comment is not found");
        }
        const post = comment.postId;
        if (tags?.length && tags.includes(req.user._id.toString())) {
            throw new BadRequestException("You can not mention yourself in the comment");
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
                Path: `users/${post.createdBy}/posts/${post.assetsFolderId}/comments`,
            });
        }
        const toUpdate = {};
        if (content?.length)
            toUpdate.content = content;
        const updateResult = await this._commentRepository.updateById({
            id: commentId,
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
            throw new BadRequestException("Failed to update the comment, try again later");
        }
        else {
            if (removedAttachments?.length) {
                await S3Service.deleteFiles({ SubKeys: removedAttachments });
            }
        }
        return successHandler({ res });
    };
    freezeComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = await this._commentRepository.findOne({
            filter: {
                _id: commentId,
            },
            options: {
                populate: [
                    {
                        path: "postId",
                        select: "assetsFolderId createdBy",
                    },
                    {
                        path: "commentId",
                        select: "createdBy",
                    },
                ],
            },
        });
        if (!comment) {
            throw new NotFoundException("Invalid postId or already freezed");
        }
        if (comment.commentId === null) {
            throw new NotFoundException("comment of this reply is not found");
        }
        if (comment.postId === null) {
            throw new NotFoundException("post of this comment is not found");
        }
        if (req.user.role === UserRoleEnum.USER &&
            !comment.createdBy.equals(req.user._id)) {
            throw new ForbiddenException("Not authorized to freeze this post");
        }
        await comment.updateOne({
            freezed: {
                at: new Date(),
                by: req.user._id,
                $unset: {
                    restored: true,
                },
            },
        });
        return successHandler({ res, message: "Comment Freezed Successfully!" });
    };
    deleteComment = async (req, res) => {
        const { commentId } = req.params;
        const comment = await this._commentRepository.findOne({
            filter: {
                _id: commentId,
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
        if (!comment) {
            throw new NotFoundException("Invalid commentId or not freezed");
        }
        const freezedBy = comment.freezed.by;
        if ((req.user.role === UserRoleEnum.USER &&
            !freezedBy._id.equals(req.user._id)) ||
            (req.user.role !== UserRoleEnum.SUPERADMIN &&
                freezedBy.role === UserRoleEnum.SUPERADMIN)) {
            throw new ForbiddenException("Not authorized to delete this post");
        }
        await Promise.all([
            this._commentRepository.deleteMany({
                filter: {
                    $or: [{ _id: commentId }, { commentId }],
                },
            }),
            comment.attachments?.length
                ? S3Service.deleteFiles({ SubKeys: comment.attachments })
                : undefined,
        ]);
        return successHandler({ res, message: "Comment Deleted Successfully!" });
    };
}
export default CommentService;
