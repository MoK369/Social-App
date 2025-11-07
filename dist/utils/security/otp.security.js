import { EmailStatusEnum, OTPTypesEnum } from "../constants/enum.constants.js";
import { BadRequestException, TooManyRequestsException, } from "../exceptions/custom.exceptions.js";
class OTP {
    static checkRequestOfNewOTP = ({ user, otpType = OTPTypesEnum.confirmEmailOTP, checkEmailStatus = EmailStatusEnum.notConfirmed, }) => {
        if (!user || checkEmailStatus === EmailStatusEnum.notConfirmed
            ? user.confirmedAt
            : !user.confirmedAt) {
            throw new BadRequestException(`Invalid Account or ${checkEmailStatus === EmailStatusEnum.notConfirmed ? "" : "NOT"} already Verified!`);
        }
        let otpObject;
        switch (otpType) {
            case OTPTypesEnum.confirmEmailOTP:
                otpObject = user.confirmEmailOtp;
                break;
            case OTPTypesEnum.forgetPasswordOTP:
                otpObject = user.resetPasswordOtp;
                break;
        }
        console.log({ otpObject });
        if (otpObject && otpObject.code) {
            if (otpObject.count >= 5) {
                if (Date.now() + 10 * 60 * 1000 - otpObject.expiresAt.getTime() >=
                    10 * 60 * 1000) {
                    otpObject.count = 0;
                }
                else {
                    throw new TooManyRequestsException("Please try after a while");
                }
            }
            else {
                if (Date.now() + 10 * 60 * 1000 - otpObject.expiresAt.getTime() <=
                    3 * 60 * 1000) {
                    otpObject.count++;
                }
                else {
                    otpObject.count = 0;
                }
            }
        }
        return otpObject?.count || 0;
    };
}
export default OTP;
