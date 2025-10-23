import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
import { ConflictException } from "../../utils/exceptions/custom.exceptions.js";
import successHandler from "../../utils/handlers/success.handler.js";
import Hashing from "../../utils/security/hash.security.js";
import sendEmail from "../../utils/email/send.email.js";
class AuthenticationService {
    userRepository = new UserRepository(UserModel);
    signup = async (req, res) => {
        const { fullName, email, password, phone, gender } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        let value = "hello";
        let num = value;
        console.log(num.toFixed(2));
        if (user) {
            throw new ConflictException("Email Already Exists!");
        }
        await this.userRepository.create({
            data: [
                {
                    fullName,
                    email,
                    password: await Hashing.generateHash({ plainText: password }),
                    phone,
                    gender,
                },
            ],
        });
        await sendEmail({ data: { to: email, html: `<h1>Hello from Social App 👋</h1>` } });
        return successHandler({
            res,
            statusCode: 201,
            message: "Account Created Succcessfully!",
        });
    };
    login = async (req, res) => {
        return res.json({ message: "User logged in successfully", body: req.body });
    };
}
export default new AuthenticationService();
