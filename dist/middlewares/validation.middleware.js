import { ValidationException } from "../utils/exceptions/custom.exceptions.js";
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        if (req.file) {
            req.body[req.file.fieldname] = req.file;
        }
        if (req.files) {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body[req.files[0].fieldname] = req.files;
            }
            else {
                const filesMap = req.files;
                for (const fieldname of Object.keys(filesMap)) {
                    req.body[fieldname] = filesMap[fieldname];
                }
            }
        }
        let validationError = {
            message: "",
            details: [],
        };
        for (const key of Object.keys(schema)) {
            console.log(key);
            if (!schema[key])
                continue;
            console.log(req[key]);
            const validationResult = await schema[key].safeParseAsync(req[key]);
            if (!validationResult.success) {
                validationError.details.push(...validationResult.error.issues.map((issue) => {
                    validationError.message += !validationError.message.length
                        ? issue.message
                        : ".\n" + issue.message;
                    return {
                        key,
                        path: issue.path.join("."),
                        message: issue.message,
                    };
                }));
            }
            else {
                if (!req.validationResult) {
                    req.validationResult = {};
                }
                Object.assign(req.validationResult, {
                    [key]: validationResult.data,
                });
            }
        }
        if (validationError.message.length > 0) {
            console.log(validationError);
            throw new ValidationException(validationError.message, validationError.details);
        }
        return next();
    };
};
export default validationMiddleware;
