import type { Model } from "mongoose";
import type { IComment as TDocument } from "../interfaces/comment.interface.ts";
import DatabaseRepository from "./database.repository.ts";

class CommentRespository extends DatabaseRepository<TDocument> {
  constructor(CommentModel: Model<TDocument>) {
    super(CommentModel);
  }
}

export default CommentRespository;
