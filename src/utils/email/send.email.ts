import { createTransport } from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { ApplicatonException } from "../exceptions/custom.exceptions.ts";
import { ErrorCodesEnum } from "../constants/enum.constants.ts";

const sendEmail = ({
  data,
}: {
  data: Mail.Options;
}): Promise<SMTPTransport.SentMessageInfo> => {
  if (!data.html && !data.attachments?.length && !data.text) {
    throw new ApplicatonException(
      ErrorCodesEnum.RESOURCE_NOT_FOUND,
      "Can't Send Email, because Email Content is Missing",
      500
    );
  }
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  return transporter.sendMail({
    ...data,
    from: `"${process.env.APP_NAME}" <${process.env.SENDER_EMAIL}>`,
  });
};

export default sendEmail;
