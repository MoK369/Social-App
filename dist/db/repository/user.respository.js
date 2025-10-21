import DatabaseRepository from "./database.repository.js";
class UserRepository extends DatabaseRepository {
    constructor(UserModel) {
        super(UserModel);
    }
}
export default UserRepository;
