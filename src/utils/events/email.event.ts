import type Mail from "nodemailer/lib/mailer/index.js";
import { EventsEnum } from "../constants/enum.constants.ts";
import sendEmail from "../email/send.email.ts";
import HTML_EMAIL_TEMPLATE from "../email/templates/html_email.template.ts";
import CustomEvents from "./custom.event.ts";
import { EventEmitter } from "node:events";

interface IEmail extends Mail.Options {
  otp: string;
}

const emailEvent = new CustomEvents<IEmail>(new EventEmitter());

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
          message:
            "Thank you for signing up ❤️, please use the otp below to verify your email",
          otpOrLink: payload.otp,
        }),
      },
    });
  },
});

export default emailEvent;
