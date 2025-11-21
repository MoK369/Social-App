import type { LeanType } from "../../utils/types/find_functions.type.ts";
import type { IPaginationResult } from "../../utils/constants/interface.constants.ts";
import type { FullIPost, IPost } from "../../db/interfaces/post.interface.ts";

export interface IGetPostListResponse<TLean extends LeanType = false>
  extends IPaginationResult<IPost, TLean> {}

export interface IGetPostByIdRespone {
  post: FullIPost;
}
