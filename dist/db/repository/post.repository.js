import DatabaseRepository from "./database.repository.js";
class PostRepository extends DatabaseRepository {
    constructor(PostModel) {
        super(PostModel);
    }
}
export default PostRepository;
