import type { IComment } from "../../db/interfaces/comment.interface.ts";

export interface IGetCommentByIdResponse {
  comment: IComment;
}
