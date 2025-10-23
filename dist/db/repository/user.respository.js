import DatabaseRepository from "./database.repository.js";
class UserRepository extends DatabaseRepository {
    constructor(UserModel) {
        super(UserModel);
    }
    findByEmail = async ({ email, projection, options, }) => {
        return this.model.findOne({ email }, projection, options);
    };
}
export default UserRepository;
