import successHandler from "../../utils/handlers/success.handler.js";
import { CommentRepository, PostRepository, UserRepository, } from "../../db/repository/index.js";
import { CommentModel, PostModel, UserModel } from "../../db/models/index.js";
import S3Service from "../../utils/multer/s3.service.js";
import { BadRequestException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import { AllowCommentsEnum } from "../../utils/constants/enum.constants.js";
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
        });
        if (!post) {
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
                Path: `users/${post.createdBy}/posts/${post.assetsFolderId}/comments`,
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
    repylOnComment = async (req, res) => {
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
                        match: {
                            allowComments: AllowCommentsEnum.allow,
                            $or: postFilterBasedOnAvailability(req),
                        },
                    },
                ],
            },
        });
        console.log({ comment });
        if (!comment?.postId) {
            throw new NotFoundException("Invalid commentId or comment doesn't exist");
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
                Path: `users/${post.createdBy}/posts/${post.assetsFolderId}/comments`,
            });
        }
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
}
export default CommentService;
