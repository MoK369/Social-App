import { EmailEventsEnum } from "../constants/enum.constants.js";
import sendEmail from "../email/send.email.js";
import HTML_EMAIL_TEMPLATE from "../email/templates/html_email.template.js";
import { BadRequestException } from "../exceptions/custom.exceptions.js";
import CustomEvents from "./custom.event.js";
import { EventEmitter } from "node:events";
const emailEvent = new CustomEvents(new EventEmitter());
emailEvent.subscribe({
    eventName: EmailEventsEnum.verifyEmail,
    backgroundFunction: async (payload) => {
        if (!payload.otp) {
            throw new BadRequestException("OTP is not provided");
        }
        const subject = "Email Verification";
        await sendEmail({
            data: {
                subject,
                to: payload.to,
                html: HTML_EMAIL_TEMPLATE({
                    title: subject,
                    message: "Thank you for signing up ❤️, please use the otp below to verify your email",
                    otpOrLink: payload.otp,
                }),
            },
        });
    },
});
emailEvent.subscribe({
    eventName: EmailEventsEnum.resetPassword,
    backgroundFunction: async (payload) => {
        if (!payload.otp) {
            throw new BadRequestException("OTP is not provided");
        }
        const subject = "Forget Password";
        await sendEmail({
            data: {
                subject,
                to: payload.to,
                html: HTML_EMAIL_TEMPLATE({
                    title: subject,
                    message: "Thank you for Using Our App ❤️, please use the otp below to verify Forget Password",
                    otpOrLink: payload.otp,
                }),
            },
        });
    },
});
emailEvent.subscribe({
    eventName: EmailEventsEnum.enableTwoFactor,
    backgroundFunction: async (payload) => {
        if (!payload.otp) {
            throw new BadRequestException("OTP is not provided");
        }
        const subject = "Enable 2FA";
        await sendEmail({
            data: {
                subject,
                to: payload.to,
                html: HTML_EMAIL_TEMPLATE({
                    title: subject,
                    message: "Thank you for Using Our App ❤️, please use the OTP below to Enable 2FA",
                    otpOrLink: payload.otp,
                }),
            },
        });
    },
});
emailEvent.subscribe({
    eventName: EmailEventsEnum.loginWithTwoFactor,
    backgroundFunction: async (payload) => {
        if (!payload.otp) {
            throw new BadRequestException("OTP is not provided");
        }
        const subject = "Login With 2FA";
        await sendEmail({
            data: {
                subject,
                to: payload.to,
                html: HTML_EMAIL_TEMPLATE({
                    title: subject,
                    message: "Thank you for Using Our App ❤️, please use the OTP below to Login Using 2FA",
                    otpOrLink: payload.otp,
                }),
            },
        });
    },
});
emailEvent.subscribe({
    eventName: EmailEventsEnum.tagNotifyingEmail,
    backgroundFunction: async (payload) => {
        const subject = "Post Tag";
        await sendEmail({
            data: {
                subject,
                to: payload.to,
                html: HTML_EMAIL_TEMPLATE({
                    title: subject,
                    message: `${payload.taggingUser} has mentioned you on their new post`,
                    otpOrLink: "",
                }),
            },
        });
    },
});
export default emailEvent;
