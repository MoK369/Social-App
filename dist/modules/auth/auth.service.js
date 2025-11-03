import UserRepository from "../../db/repository/user.respository.js";
import UserModel from "../../db/models/user.model.js";
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import successHandler from "../../utils/handlers/success.handler.js";
import Hashing from "../../utils/security/hash.security.js";
import { EmailStatusEnum, EventsEnum, OTPTypesEnum, } from "../../utils/constants/enum.constants.js";
import { generateNumericId } from "../../utils/security/id.security.js";
import emailEvent from "../../utils/events/email.event.js";
import Token from "../../utils/security/token.security.js";
import OTP from "../../utils/security/otp.security.js";
class AuthenticationService {
    userRepository = new UserRepository(UserModel);
    signup = async (req, res) => {
        const { fullName, email, password, phone, gender } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        if (user) {
            throw new ConflictException("Email Already Exists!");
        }
        const otp = generateNumericId();
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
    resendEmilOtp = async (req, res) => {
        const { email } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        const count = OTP.checkRequestOfOTP({ user });
        const otp = generateNumericId();
        await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: {
                confirmEmailOtp: {
                    expiresAt: Date.now() + 10 * 60 * 1000,
                    code: await Hashing.generateHash({
                        plainText: otp,
                    }),
                    count,
                },
            },
        });
        emailEvent.publish({
            eventName: EventsEnum.verifyEmail,
            payload: { to: email, otp },
        });
        return successHandler({ res, message: "OTP has been resent!" });
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
    sendForgetPasswordOtp = async (req, res) => {
        const { email } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        if (user?.lastResetPasswordAt &&
            Date.now() <= user.lastResetPasswordAt.getTime() + 24 * 60 * 60 * 1000) {
            throw new ForbiddenException("You have reset your password recently, please try after 24 hours from last reset");
        }
        const count = OTP.checkRequestOfOTP({
            user,
            otpType: OTPTypesEnum.forgetPasswordOTP,
            checkEmailStatus: EmailStatusEnum.confirmed,
        });
        const otp = generateNumericId();
        await this.userRepository.updateOne({
            filter: {
                _id: user._id,
            },
            update: {
                resetPasswordOtp: {
                    expiresAt: Date.now() + 10 * 60 * 1000,
                    code: await Hashing.generateHash({
                        plainText: otp,
                    }),
                    count,
                },
                $unset: {
                    resetPasswordVerificationExpiresAt: true,
                },
            },
        });
        emailEvent.publish({
            eventName: EventsEnum.resetPassword,
            payload: { to: email, otp },
        });
        return successHandler({ res, message: "OTP has been sent!" });
    };
    verifyForgetPasswordOtp = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        if (!user) {
            throw new BadRequestException("Invalid Account!");
        }
        if (!user?.resetPasswordOtp || !user.resetPasswordOtp.code) {
            throw new NotFoundException("Please request an OTP");
        }
        if (Date.now() >= user.resetPasswordOtp.expiresAt.getTime() ||
            !(await Hashing.compareHash({
                plainText: otp,
                cipherText: user.resetPasswordOtp.code,
            }))) {
            throw new BadRequestException("Invalid OTP or Has Expired!");
        }
        await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: {
                resetPasswordVerificationExpiresAt: Date.now() + 10 * 60 * 1000,
                $unset: {
                    resetPasswordOtp: true,
                },
            },
        });
        return successHandler({ res, message: "OTP verified!" });
    };
    resetForgotPassword = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userRepository.findByEmail({ email });
        if (!user) {
            throw new NotFoundException("Invalid Acccount!");
        }
        if (!user.resetPasswordVerificationExpiresAt) {
            throw new BadRequestException("Please Verify Your OTP");
        }
        if (Date.now() >= user.resetPasswordVerificationExpiresAt.getTime()) {
            throw new BadRequestException("OTP Verificatin has Expired!");
        }
        await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: {
                password: await Hashing.generateHash({ plainText: password }),
                lastResetPasswordAt: Date.now(),
                changeCredentialsTime: Date.now(),
                $unset: {
                    resetPasswordVerificationExpiresAt: true,
                },
            },
        });
        return successHandler({ res, message: "Password Reset Successfully!" });
    };
}
export default new AuthenticationService();
