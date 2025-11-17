import successHandler from "../../utils/handlers/success.handler.js";
import { UserRepository, PostRepository } from "../../db/repository/index.js";
import { UserModel, PostModel } from "../../db/models/index.js";
import { BadRequestException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import { generateAlphaNumaricId } from "../../utils/security/id.security.js";
import S3Service from "../../utils/multer/s3.service.js";
import { Types } from "mongoose";
import { AllowCommentsEnum, AvailabilityEnum, LikeActionsEnum, } from "../../utils/constants/enum.constants.js";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.js";
class PostService {
    _postRepository = new PostRepository(PostModel);
    _userRepository = new UserRepository(UserModel);
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
        if (removedAttachments?.length) {
            await S3Service.deleteFiles({
                SubKeys: removedAttachments,
            });
        }
        return successHandler({ res });
    };
}
export default PostService;
