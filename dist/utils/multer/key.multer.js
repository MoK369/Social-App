import { generateAlphaNumaricId } from "../security/id.security.js";
class KeyUtil {
    static generateS3Key = ({ Path, tag, originalname, }) => {
        return `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
            size: 24,
        })}${tag ? `_${tag}` : ""}_${originalname}`;
    };
    static generateS3KeyFromSubKey = (subKey) => {
        return `${process.env.APP_NAME}/${subKey}`;
    };
    static generateS3SubKey = ({ Path, tag, originalname, }) => {
        return `${Path}/${generateAlphaNumaricId({
            size: 24,
        })}${tag ? `_${tag}` : ""}_${originalname}`;
    };
    static generateS3UploadsUrlFromSubKey = ({ req, subKey, }) => {
        return `${req.protocol}://${req.get("host")}/uploads/${this.generateS3KeyFromSubKey(subKey)}`;
    };
}
export default KeyUtil;
