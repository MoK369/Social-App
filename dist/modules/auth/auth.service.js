import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
import { BadRequestException, ConflictException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import successHandler from "../../utils/handlers/success.handler.js";
import Hashing from "../../utils/security/hash.security.js";
import { EventsEnum } from "../../utils/constants/enum.constants.js";
import { generateNumaricOTP } from "../../utils/security/id.security.js";
import emailEvent from "../../utils/events/email.event.js";
import Token from "../../utils/security/token.security.js";
class AuthenticationService {
    userRepository = new UserRepository(UserModel);
    signup = async (req, res) => {
        const { fullName, email, password, phone, gender } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        if (user) {
            throw new ConflictException("Email Already Exists!");
        }
        const otp = generateNumaricOTP();
        await this.userRepository.create({
            data: [
                {
                    fullName,
                    email,
                    password: await Hashing.generateHash({ plainText: password }),
                    phone,
                    gender,
                    confirmEmailOtp: {
                        code: await Hashing.generateHash({ plainText: otp }),
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    },
                },
            ],
        });
        emailEvent.publish({
            eventName: EventsEnum.verifyEmail,
            payload: { to: email, otp },
        });
        return successHandler({
            res,
            statusCode: 201,
            message: "Account Created Succcessfully!",
        });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userRepository.findOne({
            filter: {
                email,
                confirmEmailOtp: { $exists: true },
                confirmedAt: { $exists: false },
            },
        });
        if (!user) {
            throw new ConflictException("Invalid Account or already Verified!");
        }
        if (Date.now() >= user.confirmEmailOtp?.expiresAt?.getTime()) {
            throw new BadRequestException("OTP has expired!");
        }
        if (!(await Hashing.compareHash({
            plainText: otp,
            cipherText: user.confirmEmailOtp?.code,
        }))) {
            throw new BadRequestException("Invalid OTP!");
        }
        await this.userRepository.updateOne({
            filter: { email },
            update: {
                confirmedAt: Date.now(),
                $unset: {
                    confirmEmailOtp: 1,
                },
            },
        });
        return successHandler({ res, message: "Account Verified!" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userRepository.findByEmail({
            email,
        });
        if (!user) {
            throw new NotFoundException("Invalid Login Credentials");
        }
        if (!user.confirmedAt) {
            throw new BadRequestException("Email Not Verified");
        }
        if (!(await Hashing.compareHash({
            plainText: password,
            cipherText: user.password,
        }))) {
            throw new NotFoundException("Invalid Login Credentials");
        }
        const tokenCredentials = Token.getTokensBasedOnRole({ user });
        return successHandler({
            res,
            message: "User logged in successfully",
            body: {
                ...tokenCredentials,
                user,
            },
        });
    };
}
export default new AuthenticationService();
