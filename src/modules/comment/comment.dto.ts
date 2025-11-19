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
