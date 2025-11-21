import type { Request, Response } from "express";
import successHandler from "../../utils/handlers/success.handler.ts";
import {
  UserRepository,
  PostRepository,
  CommentRepository,
} from "../../db/repository/index.ts";
import { UserModel, PostModel, CommentModel } from "../../db/models/index.ts";
import type {
  CreatePostBodyDtoType,
  DeletePostParamsDtoType,
  FreezePostParamsDtoType,
  GetPostByIdParamDtoType,
  GetPostListQueryDtoType,
  LikePostParamsDtoType,
  LikePostQueryDtoType,
  UpdatePostBodyDtoType,
  UpdatePostParamsDtoType,
} from "./post.dto.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import { generateAlphaNumaricId } from "../../utils/security/id.security.ts";
import S3Service from "../../utils/multer/s3.service.ts";
import { Types, type PopulateOptions } from "mongoose";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  LikeActionsEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.ts";
import type {
  IGetPostByIdRespone,
  IGetPostListResponse,
} from "./post.entity.ts";
import type { IPaginationPostResult } from "../../utils/constants/interface.constants.ts";
import { connectedSockets, io } from "../gateway/gateway.ts";
import type { FullIUser } from "../../db/interfaces/user.interface.ts";

class PostService {
  private _postRepository = new PostRepository(PostModel);
  private _userRepository = new UserRepository(UserModel);
  private _commentRepository = new CommentRepository(CommentModel);

  createPost = async (req: Request, res: Response): Promise<Response> => {
    const { content, attachments, allowComments, availability, tags } = req
      .validationResult.body as CreatePostBodyDtoType;

    if (availability === AvailabilityEnum.onlyMe && tags?.length) {
      throw new BadRequestException("tags are not allowed with onlyMe posts");
    }
    if (tags?.length && tags.includes(req.user!._id!.toString())) {
      throw new BadRequestException("You can not mention yourself in the post");
    }
    if (
      tags?.length &&
      (
        await this._userRepository.find({
          filter: {
            _id: { $in: tags },
          },
        })
      ).length !== tags.length
    ) {
      throw new NotFoundException("Some of tagged users are not found");
    }

    let attachmentsSubKeys: string[] = [];
    const assetsFolderId = generateAlphaNumaricId();

    if (attachments?.length) {
      attachmentsSubKeys = await S3Service.uploadFiles({
        Files: attachments as Express.Multer.File[],
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
            createdBy: req.user!._id!,
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
        throw new BadRequestException(
          "Failed to create the post, try again later"
        );
      });

    return successHandler({
      res,
      statusCode: 201,
      message: "Post created successfull!",
    });
  };

  likePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as LikePostParamsDtoType;
    const { action } = req.validationResult.query as LikePostQueryDtoType;

    const toUpdateObject =
      action === LikeActionsEnum.like
        ? { $addToSet: { likes: req.user!._id } }
        : { $pull: { likes: req.user!._id } };

    const post = await this._postRepository.findOneAndUpdate({
      filter: {
        _id: postId,
        $or: postFilterBasedOnAvailability(req),
      },
      update: toUpdateObject,
    });

    if (!post) {
      throw new NotFoundException(
        "invalid postId, invalid user account, or post doens't exit"
      );
    }

    if (action !== LikeActionsEnum.unlike) {
      io.to(connectedSockets.get(post.createdBy.toString()) || []).emit(
        "likePost",
        {
          postId,
          userId: req.user!._id!,
        }
      );
    }

    return successHandler({ res });
  };

  updatePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as UpdatePostParamsDtoType;
    const {
      content,
      attachments = [],
      allowComments,
      availability,
      tags = [],
      removedAttachments = [],
      removedTags = [],
    } = req.body as UpdatePostBodyDtoType;

    const post = await this._postRepository.findOne({
      filter: {
        _id: postId,
        createdBy: req.user!._id!,
      },
    });
    if (!post) throw new NotFoundException("post not Found");

    if (availability === AvailabilityEnum.onlyMe && tags?.length) {
      throw new BadRequestException("tags are not allowed with onlyMe posts");
    }
    if (tags?.length && tags.includes(req.user!._id!.toString())) {
      throw new BadRequestException("You can not mention yourself in the post");
    }
    if (
      tags?.length &&
      (
        await this._userRepository.find({
          filter: {
            _id: { $in: tags },
          },
        })
      ).length !== tags.length
    ) {
      throw new NotFoundException("Some of tagged users are not found");
    }

    let attachmentsSubKeys: string[] = [];
    if (attachments?.length) {
      attachmentsSubKeys = await S3Service.uploadFiles({
        Files: attachments as Express.Multer.File[],
        Path: `users/${post.createdBy}/posts/${post.assetsFolderId}`,
      });
    }

    const toUpdate: {
      content?: string;
      allowComments?: AllowCommentsEnum;
      availability?: AvailabilityEnum;
    } = {};
    if (content?.length) toUpdate.content = content;
    if (allowComments) toUpdate.allowComments = allowComments;
    if (availability) toUpdate.availability = availability;

    const updateResult = await this._postRepository.updateById<[]>({
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
                    removedTags.map((tag) =>
                      Types.ObjectId.createFromHexString(tag)
                    ),
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
      throw new BadRequestException(
        "Failed to update the post, try again later"
      );
    } else {
      if (removedAttachments?.length) {
        await S3Service.deleteFiles({ SubKeys: removedAttachments });
      }
    }

    return successHandler({ res });
  };

  private _populationOfGettingOneCommentOneReplyForPost =
    (): PopulateOptions[] => {
      return [
        {
          path: "comments",
          match: {
            commentId: { $exists: false },
            freezed: { $exists: false },
          },
          transform(doc, id) {
            return doc?.toJSON();
          },
          populate: [
            {
              path: "reply",
              match: {
                commentId: { $exists: true },
                freezed: { $exists: false },
              },
              transform(doc, id) {
                return doc?.toJSON();
              },
              populate: [
                {
                  path: "reply",
                  match: {
                    commentId: { $exists: true },
                    freezed: { $exists: false },
                  },
                  transform(doc, id) {
                    return doc?.toJSON();
                  },
                },
              ],
            },
          ],
        },
      ];
    };

  getPostList = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, size = 5 } = req.query as GetPostListQueryDtoType;

    const paginationResult: IPaginationPostResult =
      await this._postRepository.paginate({
        filter: {
          $or: postFilterBasedOnAvailability(req),
        },
        options: {
          populate: this._populationOfGettingOneCommentOneReplyForPost(),
        },
        page,
        size,
      });

    return successHandler<IGetPostListResponse>({
      res,
      body: paginationResult,
    });
  };

  getPostById = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as GetPostByIdParamDtoType;

    const post = await this._postRepository.findOne({
      filter: {
        _id: postId,
        createdBy: req.user!._id!,
      },
      options: {
        populate: this._populationOfGettingOneCommentOneReplyForPost(),
      },
    });

    if (!post) {
      throw new NotFoundException("Invalid postId, or post doesn't exist");
    }

    return successHandler<IGetPostByIdRespone>({ res, body: { post } });
  };

  freezePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as FreezePostParamsDtoType;

    const post = await this._postRepository.findOne({
      filter: {
        _id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException("Invalid postId or already freezed");
    }

    if (
      req.user!.role! === UserRoleEnum.USER &&
      !post.createdBy.equals(req.user!._id!)
    ) {
      throw new ForbiddenException("Not authorized to freeze this post");
    }

    await post.updateOne({
      freezed: { at: new Date(), by: req.user!._id! },
      $unset: {
        restored: true,
      },
    });

    return successHandler({ res, message: "Post Freezed Successfully!" });
  };

  deletePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as DeletePostParamsDtoType;

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

    if (!post) {
      throw new NotFoundException("Invalid postId or not freezed");
    }

    const freezedBy = post.freezed!.by as unknown as FullIUser;

    if (
      (req.user!.role! === UserRoleEnum.USER &&
        !freezedBy._id.equals(req.user!._id!)) ||
      (req.user!.role! !== UserRoleEnum.SUPERADMIN &&
        freezedBy.role! === UserRoleEnum.SUPERADMIN)
    ) {
      throw new ForbiddenException("Not authorized to delete this post");
    }

    await Promise.all([
      post.deleteOne(),
      this._commentRepository.deleteMany({
        filter: {
          postId: post._id,
        },
      }),
      post.attachments?.length
        ? S3Service.deleteFolderByPrefix({
            FolderPath: `users/${post.createdBy}/posts/${post.assetsFolderId}`,
          })
        : undefined,
    ]);

    return successHandler({ res, message: "Post Deleted Successfully!" });
  };
}

export default PostService;
