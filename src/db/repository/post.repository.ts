import type { Model } from "mongoose";
import type { IPost as TDocument } from "../interfaces/post.interface.ts";
import DatabaseRepository from "./database.repository.ts";

class PostRepository extends DatabaseRepository<TDocument> {
  constructor(PostModel: Model<TDocument>) {
    super(PostModel);
  }
}

export default PostRepository;
