import type { Model, ProjectionType, RootFilterQuery } from "mongoose";
import type { IPost as TDocument } from "../interfaces/post.interface.ts";
import DatabaseRepository from "./database.repository.ts";
import type { FindFunctionOptionsType } from "../../utils/types/find_functions.type.ts";
import { CommentRepository } from "./index.ts";
import { CommentModel } from "../models/index.ts";
import type { FindPostCursorFunctionReturnType } from "../../utils/types/find_post_cursor_function.type.ts";
import type { IPaginationPostResult } from "../../utils/constants/interface.constants.ts";

class PostRepository extends DatabaseRepository<TDocument> {
  private _commentRepository = new CommentRepository(CommentModel);
  constructor(PostModel: Model<TDocument>) {
    super(PostModel);
  }

  findCursor = async <TLean extends boolean = false>({
    filter,
    projection,
    options = {},
  }: {
    filter: RootFilterQuery<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: FindFunctionOptionsType<TDocument, TLean>;
  }): Promise<FindPostCursorFunctionReturnType<TLean>> => {
    const cursor = this.model.find(filter, projection, options).cursor();

    const result = [];
    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      const comments = await this._commentRepository.find({
        filter: { postId: doc!._id, commentId: { $exists: false } },
      });
      result.push({ post: doc, comments });
    }

    return result;
  };

  findCursorWithPagination = async <TLean extends boolean = false>({
    filter,
    projection,
    options = {},
    page = "all",
    size,
  }: {
    filter: RootFilterQuery<TDocument>;
    projection?: ProjectionType<TDocument>;
    options?: FindFunctionOptionsType<TDocument, TLean>;
    page: number | "all";
    size: number;
  }): Promise<IPaginationPostResult<TLean>> => {
    let docsCount;
    let totalPages;
    if (page !== "all") {
      page = Math.floor(!page || page < 1 ? 1 : page);
      options.limit = Math.floor(!size || size < 1 ? 5 : size);
      options.skip = (page - 1) * size;

      docsCount = await this.model.countDocuments(filter);
      totalPages = Math.ceil(docsCount / size);
    }
    const cursor = this.model.find(filter, projection, options).cursor();

    const result = [];
    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      console.log("inside the for loop ", doc);

      const comments = await this._commentRepository.find({
        filter: { postId: doc!._id, commentId: { $exists: false } },
      });
      result.push({ post: doc, comments });
    }

    console.log({ result });

    return {
      docsCount,
      totalPages,
      currentPage: page !== "all" ? page : undefined,
      size: page !== "all" ? size : undefined,
      result,
    };
  };
}

export default PostRepository;
