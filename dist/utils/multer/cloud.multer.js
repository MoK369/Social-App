import multer from "multer";
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { generateAlphaNumaricId } from "../security/id.security.js";
import { ValidationException } from "../exceptions/custom.exceptions.js";
class CloudMulter {
    static _tempFolderPath = "./Temp";
    static cloudFileUpload = ({ validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, } = {}) => {
        const storage = storageApproach === StorageTypesEnum.memory
            ? multer.memoryStorage()
            : multer.diskStorage({
                destination: async function (req, file, callback) {
                    await access(resolve(CloudMulter._tempFolderPath)).catch(async (error) => {
                        if (error.code == "ENOENT") {
                            await mkdir(resolve(CloudMulter._tempFolderPath), {
                                recursive: true,
                            });
                        }
                    });
                    callback(null, CloudMulter._tempFolderPath);
                },
                filename: function (req, file, callback) {
                    callback(null, `${generateAlphaNumaricId({ size: 24 })}_${file.originalname}`);
                },
            });
        const fileFilter = (req, file, callback) => {
            if (!validation.includes(file.mimetype)) {
                callback(new ValidationException("Invalid File. File must be an image", [
                    { path: "image", message: "Invalid File Format!" },
                ]));
            }
            callback(null, true);
        };
        return multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });
    };
    static handleSingleFileUpload = ({ fieldName, validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, }) => {
        return (req, res, next) => this.cloudFileUpload({ validation, maxFileSize, storageApproach }).single(fieldName)(req, res, function (err) {
            if (err) {
                if (err.code == "LIMIT_FILE_SIZE")
                    next(new ValidationException("File is too large", [
                        { path: fieldName, message: "Invalid Image Size" },
                    ]));
                else
                    next(err);
            }
            next();
        });
    };
}
export default CloudMulter;
