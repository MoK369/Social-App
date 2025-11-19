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
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import type {
  CreateCommentBodyDtoType,
  CreateCommentParamsDtoType,
  ReplyOnCommentParamsDtoType,
} from "./comment.dto.ts";
import { AllowCommentsEnum } from "../../utils/constants/enum.constants.ts";
import { postFilterBasedOnAvailability } from "../../utils/filter/post.filter.ts";
import { Types } from "mongoose";
import type { HIPost } from "../../db/interfaces/post.interface.ts";

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
    });

    if (!post) {
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

  repylOnComment = async (req: Request, res: Response): Promise<Response> => {
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
}

export default CommentService;
