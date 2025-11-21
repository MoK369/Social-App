import KeyUtil from "../multer/key.multer.js";
class GetFullUrl {
    static getFullUrlOfAttachments = (attachmentsList) => {
        const newAttachments = [];
        for (const attachment of attachmentsList) {
            newAttachments.push(KeyUtil.generateS3UploadsUrlFromSubKey({
                req: {
                    host: process.env.HOST,
                    protocol: process.env.PROTOCOL,
                },
                subKey: attachment,
            }));
        }
        return newAttachments;
    };
}
export default GetFullUrl;
