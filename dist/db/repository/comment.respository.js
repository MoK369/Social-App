import DatabaseRepository from "./database.repository.js";
class CommentRespository extends DatabaseRepository {
    constructor(CommentModel) {
        super(CommentModel);
    }
}
export default CommentRespository;
