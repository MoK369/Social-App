import type { LeanType } from "../types/find_functions.type.ts";
import type { HydratedDocument } from "mongoose";
import type { FlattenMaps } from "mongoose";
import type { LeanOptions, Require_id } from "mongoose";
import type { IPost } from "../../db/interfaces/post.interface.ts";
import type { IComment } from "../../db/interfaces/comment.interface.ts";

export type FindPostCursorFunctionReturnType<Lean extends LeanType> = Lean extends
  | true
  | LeanOptions
  ? {
      post: Require_id<FlattenMaps<IPost>> | null;
      comments: (Require_id<FlattenMaps<IComment>> | null)[];
    }[]
  : {
      post: HydratedDocument<IPost> | null;
      comments: (HydratedDocument<IComment> | null)[];
    }[];