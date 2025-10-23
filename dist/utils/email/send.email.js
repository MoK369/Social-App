import { createTransport } from "nodemailer";
import { ApplicatonException } from "../exceptions/custom.exceptions.js";
const sendEmail = ({ data, }) => {
    if (!data.html && !data.attachments?.length && !data.text) {
        throw new ApplicatonException("Can't Send Email, because Email Content is Missing", 500);
    }
    const transporter = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
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
