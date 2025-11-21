import KeyUtil from "../multer/key.multer.ts";

class GetFullUrl {
  static getFullUrlOfAttachments = (attachmentsList: string[]): string[] => {
    const newAttachments = [];
    for (const attachment of attachmentsList) {
      newAttachments.push(
        KeyUtil.generateS3UploadsUrlFromSubKey({
          req: {
            host: process.env.HOST!,
            protocol: process.env.PROTOCOL!,
          },
          subKey: attachment,
        })
      );
    }
    return newAttachments;
  };
}

export default GetFullUrl;
