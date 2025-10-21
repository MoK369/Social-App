import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
class AuthenticationService {
    userRepository = new UserRepository(UserModel);
    signup = async (req, res) => {
        const { fullName, email, password, phone, gender } = req.body;
        await this.userRepository.create({
            data: [{ fullName, email, password, phone, gender }],
        });
        return res.status(201).json({ message: "User signed up successfully" });
    };
    login = async (req, res) => {
        return res.json({ message: "User logged in successfully", body: req.body });
    };
}
export default new AuthenticationService();
