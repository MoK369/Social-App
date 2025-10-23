import { createTransport } from "nodemailer";
import { ApplicatonException } from "../exceptions/custom.exceptions.js";
import { ErrorCodesEnum } from "../constants/enum.constants.js";
const sendEmail = ({ data, }) => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new ApplicatonException(ErrorCodesEnum.RESOURCE_NOT_FOUND, "Can't Send Email, because Email Content is Missing", 500);
    }
    const transporter = createTransport({
        host: process.env.HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Boolean(process.env.IS_SECURE),
        service: process.env.SERVICE,
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
