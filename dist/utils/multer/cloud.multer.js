import multer, { MulterError } from "multer";
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { generateAlphaNumaricId } from "../security/id.security.js";
import { BadRequestException, ValidationException, } from "../exceptions/custom.exceptions.js";
class CloudMulter {
    static _tempFolderPath = "./Temp";
    static cloudFileUpload = ({ validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, }) => {
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
                    {
                        key: "body",
                        path: file.fieldname,
                        message: "Invalid File Format!",
                    },
                ]));
            }
            callback(null, true);
        };
        return multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });
    };
    static handleSingleFileUpload = ({ fieldName, validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, }) => {
        return (req, res, next) => this.cloudFileUpload({
            validation,
            maxFileSize,
            storageApproach,
        }).single(fieldName)(req, res, (err) => {
            this._errorHandleFunction([fieldName], [1], err, next);
        });
    };
    static handleArrayFilesUpload = ({ fieldName, maxCount = 100, validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, }) => {
        return (req, res, next) => this.cloudFileUpload({
            validation,
            maxFileSize,
            storageApproach,
        }).array(fieldName, maxCount)(req, res, (err) => {
            this._errorHandleFunction([fieldName], [maxCount], err, next);
        });
    };
    static handleMultipleFilesUploads = ({ fields, validation = [], maxFileSize = 512 * 1024, storageApproach = StorageTypesEnum.memory, }) => {
        return (req, res, next) => this.cloudFileUpload({
            validation,
            maxFileSize,
            storageApproach,
        }).fields(fields)(req, res, (err) => {
            const fieldsNames = [];
            const maxCounts = [];
            for (const field of fields) {
                fieldsNames.push(field.name);
                maxCounts.push(field.maxCount);
            }
            this._errorHandleFunction(fieldsNames, maxCounts, err, next);
        });
    };
    static _errorHandleFunction = (fieldsNames, maxCounts, err, next) => {
        if (err instanceof MulterError) {
            console.log("==============");
            console.log({ err });
            if (err.code == "LIMIT_FILE_SIZE")
                next(new ValidationException("File is too large 📁", [
                    {
                        key: "body",
                        path: err.field || "",
                        message: "Invalid Image Size",
                    },
                ]));
            if (err.code == "LIMIT_UNEXPECTED_FILE")
                if (!fieldsNames.includes(err.field || ""))
                    next(new BadRequestException(`Unexpected field allowed field is ${fieldsNames}`));
                else
                    next(new BadRequestException(`Unexpected numbers of files, allowed number is ${maxCounts}`));
            else
                next(err);
        }
        next();
    };
}
export default CloudMulter;
