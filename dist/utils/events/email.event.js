import { EventsEnum } from "../constants/enum.constants.js";
import sendEmail from "../email/send.email.js";
import HTML_EMAIL_TEMPLATE from "../email/templates/html_email.template.js";
import CustomEvents from "./custom.event.js";
import { EventEmitter } from "node:events";
const emailEvent = new CustomEvents(new EventEmitter());
emailEvent.subscribe({
    eventName: EventsEnum.verifyEmail,
    backgroundFunction: async (payload) => {
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
export default emailEvent;
