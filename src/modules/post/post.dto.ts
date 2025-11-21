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

export type GetPostListQueryDtoType = z.infer<
  typeof PostValidators.getPostList.query
>;

export type FreezePostParamsDtoType = z.infer<
  typeof PostValidators.freezePost.params
>;

export type DeletePostParamsDtoType = z.infer<
  typeof PostValidators.deletePost.params
>;
