import { TokenTypesEnum } from "../utils/constants/enum.constants.js";
import Token from "../utils/security/token.security.js";
import { z } from "zod";
import { ValidationException } from "../utils/exceptions/custom.exceptions.js";
const authenticationMiddleware = ({ tokenType = TokenTypesEnum.access, } = {}) => {
    return async (req, res, next) => {
        const schema = z.object({
            authorization: z.string().regex(/^(Bearer|System)\ .*\..*\..*$/),
        });
        const result = await schema.safeParseAsync(req.headers);
        if (!result.success) {
            throw new ValidationException("authorization field is required", result.error.issues.map((issue) => {
                return {
                    path: issue.path.join("."),
                    message: issue.message,
                };
            }));
        }
        const { user, payload } = await Token.decode({
            authorization: req.headers.authorization,
            tokenType,
        });
        res.locals.user = user;
        res.locals.payload = payload;
        next();
    };
};
export default authenticationMiddleware;
