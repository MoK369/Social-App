import UserModel from "../../db/models/user.model.js";
import UserRepository from "../../db/repository/user.respository.js";
import successHandler from "../../utils/handlers/success.handler.js";
class UserService {
    userRepository = new UserRepository(UserModel);
    profile = async (req, res) => {
        return successHandler({ res, message: "User Profile!", body: req.user });
    };
}
export default new UserService();
