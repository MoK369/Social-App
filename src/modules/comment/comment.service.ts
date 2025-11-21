import type { Request, Response } from "express";
import successHandler from "../../utils/handlers/success.handler.ts";
import {
  CommentRepository,
  PostRepository,
  UserRepository,
} from "../../db/repository/index.ts";
import { CommentModel, PostModel, UserModel } from "../../db/models/index.ts";
import S3Service from "../../utils/multer/s3.service.ts";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import type {
  CreateCommentBodyDtoType,
  CreateCommentParamsDtoType,
  FreezeCommentParamsDtoType,
  GetCommentByIdParamsDtoType,
  ReplyOnCommentParamsDtoType,
  UpdateCommentBodyDtoType,
  UpdateCommentParamsDtoType,
} from "./comment.dto.ts";
import {
  AllowCommentsEnum,
  UserRoleEnum,
} from "../../utils/constants/enum.constants.ts";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.ts";
import { Types } from "mongoose";
import type {
  FullIPost,
  HIPost,
  IPost,
} from "../../db/interfaces/post.interface.ts";
import type {
  FullIUser,
  HIUser,
  IUser,
} from "../../db/interfaces/user.interface.ts";
import type { IGetCommentByIdResponse } from "./comment.entity.ts";

class CommentService {
  private _userRepository = new UserRepository(UserModel);
  private _postRepository = new PostRepository(PostModel);
  private _commentRepository = new CommentRepository(CommentModel);

  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as CreateCommentParamsDtoType;
    const { content, attachments, tags } = req.validationResult
      .body as CreateCommentBodyDtoType;

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
        Path: `users/${(post.createdBy as unknown as FullIUser)._id}/posts/${
          post.assetsFolderId
        }/comments`,
      });
    }

    await this._commentRepository
      .create({
        data: [
          {
            postId: Types.ObjectId.createFromHexString(postId),
            content,
            attachments: attachmentsSubKeys,
            createdBy: req.user!._id!,
            tags: tags?.map((tag) => Types.ObjectId.createFromHexString(tag)),
          },
        ],
      })
      .catch(async () => {
        if (attachments?.length) {
          await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
        }
        throw new BadRequestException(
          "Failed to create the comment, try again later"
        );
      });

    return successHandler({
      res,
      statusCode: 201,
      message: "Comment created successfully!",
    });
  };

  getCommentById = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as GetCommentByIdParamsDtoType;

    const comment = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
        createdBy: req.user!._id!,
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
      throw new NotFoundException(
        "Invalid commentId, or comment doesn't exist"
      );
    }

    if (
      comment.postId === null ||
      ((comment.postId as unknown as IPost).createdBy as unknown as IUser) ===
        null
    ) {
      throw new NotFoundException("post of this comment is not found");
    }

    return successHandler<IGetCommentByIdResponse>({ res, body: { comment } });
  };

  replyOnComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId, commentId } = req.params as ReplyOnCommentParamsDtoType;
    const { content, attachments, tags } = req.validationResult
      .body as CreateCommentBodyDtoType;

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

    if (
      !comment?.postId ||
      (comment.postId as unknown as FullIPost).createdBy === null
    ) {
      throw new NotFoundException(
        "Invalid commentId, comment doesn't exist or post doesn't exit"
      );
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
      const post = comment.postId as HIPost;
      attachmentsSubKeys = await S3Service.uploadFiles({
        Files: attachments as Express.Multer.File[],
        Path: `users/${(post.createdBy as unknown as HIUser)._id}/posts/${
          post.assetsFolderId
        }/comments`,
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
            createdBy: req.user!._id!,
            tags: tags?.map((tag) => Types.ObjectId.createFromHexString(tag)),
          },
        ],
      })
      .catch(async () => {
        if (attachments?.length) {
          await S3Service.deleteFiles({ SubKeys: attachmentsSubKeys });
        }
        throw new BadRequestException(
          "Failed to create the reply comment, try again later"
        );
      });

    return successHandler({
      res,
      statusCode: 201,
      message: "Reply comment created successfully!",
    });
  };

  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as UpdateCommentParamsDtoType;
    const {
      content,
      attachments = [],
      tags = [],
      removedAttachments = [],
      removedTags = [],
    } = req.body as UpdateCommentBodyDtoType;

    const comment = await this._commentRepository.findOne({
      filter: {
        _id: commentId,
        createdBy: req.user!._id!,
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

    if (!comment) throw new NotFoundException("comment not Found");

    if (comment.commentId === null) {
      throw new NotFoundException("comment of this reply is not found");
    }

    if (comment.postId === null) {
      throw new NotFoundException("post of this comment is not found");
    }

    const post = comment.postId as unknown as FullIPost;

    if (tags?.length && tags.includes(req.user!._id!.toString())) {
      throw new BadRequestException(
        "You can not mention yourself in the comment"
      );
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
        Path: `users/${post.createdBy}/posts/${post.assetsFolderId}/comments`,
      });
    }

    const toUpdate: {
      content?: string;
    } = {};
    if (content?.length) toUpdate.content = content;

    const updateResult = await this._commentRepository.updateById<[]>({
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
        "Failed to update the comment, try again later"
      );
    } else {
      if (removedAttachments?.length) {
        await S3Service.deleteFiles({ SubKeys: removedAttachments });
      }
    }

    return successHandler({ res });
  };

  freezeComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as FreezeCommentParamsDtoType;

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

    if (
      req.user!.role! === UserRoleEnum.USER &&
      !comment.createdBy.equals(req.user!._id!)
    ) {
      throw new ForbiddenException("Not authorized to freeze this post");
    }

    await comment.updateOne({
      freezed: {
        at: new Date(),
        by: req.user!._id!,
        $unset: {
          restored: true,
        },
      },
    });

    return successHandler({ res, message: "Comment Freezed Successfully!" });
  };
  deleteComment = async (req: Request, res: Response): Promise<Response> => {
    const { commentId } = req.params as FreezeCommentParamsDtoType;

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

    const freezedBy = comment.freezed!.by as unknown as FullIUser;

    if (
      (req.user!.role! === UserRoleEnum.USER &&
        !freezedBy._id.equals(req.user!._id!)) ||
      (req.user!.role! !== UserRoleEnum.SUPERADMIN &&
        freezedBy.role! === UserRoleEnum.SUPERADMIN)
    ) {
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
