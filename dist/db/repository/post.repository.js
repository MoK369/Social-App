import DatabaseRepository from "./database.repository.js";
import { CommentRepository } from "./index.js";
import { CommentModel } from "../models/index.js";
class PostRepository extends DatabaseRepository {
    _commentRepository = new CommentRepository(CommentModel);
    constructor(PostModel) {
        super(PostModel);
    }
    findCursor = async ({ filter, projection, options = {}, }) => {
        const cursor = this.model.find(filter, projection, options).cursor();
        const result = [];
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            const comments = await this._commentRepository.find({
                filter: { postId: doc._id, commentId: { $exists: false } },
            });
            result.push({ post: doc, comments });
        }
        return result;
    };
    findCursorWithPagination = async ({ filter, projection, options = {}, page = "all", size, }) => {
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
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            console.log("inside the for loop ", doc);
            const comments = await this._commentRepository.find({
                filter: { postId: doc._id, commentId: { $exists: false } },
            });
            result.push({ post: doc, comments });
        }
        console.log({ result });
        return {
            totalCount: docsCount,
            totalPages,
            currentPage: page !== "all" ? page : undefined,
            size: page !== "all" ? size : undefined,
            result,
        };
    };
}
export default PostRepository;
