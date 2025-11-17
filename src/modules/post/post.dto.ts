import { z } from "zod";
import type PostValidators from "./post.validation.ts";

export type CreatePostBodyDtoType = z.infer<
  typeof PostValidators.createPost.body
>;

export type UpdatePostBodyDtoType = z.infer<
  typeof PostValidators.updatePost.body
>;
export type UpdatePostParamsDtoType = z.infer<
  typeof PostValidators.updatePost.params
>;

export type LikePostParamsDtoType = z.infer<
  typeof PostValidators.likePost.params
>;

export type LikePostQueryDtoType = z.infer<
  typeof PostValidators.likePost.query
>;
