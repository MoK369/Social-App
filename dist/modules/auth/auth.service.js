import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
import { ConflictException } from "../../utils/exceptions/custom.exceptions.js";
class AuthenticationService {
    userRepository = new UserRepository(UserModel);
    signup = async (req, res) => {
        let { fullName, email, password, phone, gender } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        console.log({ user });
        if (user) {
            throw new ConflictException("Email Already Exists!");
        }
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
