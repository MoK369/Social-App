import { BadRequestException } from "../utils/exceptions/custom.exceptions.js";
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        console.log(schema);
        console.log(Object.keys(schema));
        let validationError = {};
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = await schema[key].safeParseAsync(req[key]);
            if (!validationResult.success) {
                validationError[key] = validationResult.error.issues.map((issue) => {
                    return {
                        path: issue.path.join("."),
                        message: issue.message,
                    };
                });
            }
        }
        if (Object.keys(validationError).length > 0) {
            throw new BadRequestException("Validation Error", validationError);
        }
        return next();
    };
};
export default validationMiddleware;
