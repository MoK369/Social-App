import { ValidationException } from "../utils/exceptions/custom.exceptions.js";
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        let validationError = {
            message: "",
            details: [],
        };
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = await schema[key].safeParseAsync(req[key]);
            if (!validationResult.success) {
                validationError.details.push(...validationResult.error.issues.map((issue) => {
                    validationError.message += !validationError.message.length
                        ? issue.message
                        : ".\n" + issue.message;
                    return {
                        path: issue.path.join("."),
                        message: issue.message,
                    };
                }));
            }
            else {
                req.validationResult = {
                    ...(req.validationResult || {}),
                    [key]: validationResult.data,
                };
            }
        }
        if (validationError.message.length > 0) {
            throw new ValidationException(validationError.message, validationError.details);
        }
        return next();
    };
};
export default validationMiddleware;
