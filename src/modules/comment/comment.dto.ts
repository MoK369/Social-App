import { z } from "zod";
import type CommentValidator from "./comment.validation.ts";

export type CreateCommentParamsDtoType = z.infer<
  typeof CommentValidator.createComment.params
>;

export type CreateCommentBodyDtoType = z.infer<
  typeof CommentValidator.createComment.body
>;

export type ReplyOnCommentParamsDtoType = z.infer<
  typeof CommentValidator.reployOnComment.params
>;

export type ReplyOnCommentBodyDtoType = z.infer<
  typeof CommentValidator.reployOnComment.body
>;

export type GetCommentByIdParamsDtoType = z.infer<
  typeof CommentValidator.getCommentById.params
>;

export type UpdateCommentParamsDtoType = z.infer<
  typeof CommentValidator.updateComment.params
>;

export type UpdateCommentBodyDtoType = z.infer<
  typeof CommentValidator.updateComment.body
>;

export type FreezeCommentParamsDtoType = z.infer<
  typeof CommentValidator.freezeComment.params
>;

export type DeleteCommentParamsDtoType = z.infer<
  typeof CommentValidator.deleteComment.params
>;
