import { TokenTypesEnum, UserRoleEnum, } from "../utils/constants/enum.constants.js";
import Token from "../utils/security/token.security.js";
import { z } from "zod";
import { ForbiddenException, ValidationException, } from "../utils/exceptions/custom.exceptions.js";
class Auths {
    static authenticationMiddleware = ({ tokenType = TokenTypesEnum.access, } = {}) => {
        return async (req, res, next) => {
            const schema = z.object({
                authorization: z.string().regex(/^(Bearer|System)\ .*\..*\..*$/),
            });
            const result = await schema.safeParseAsync(req.headers);
            if (!result.success) {
                throw new ValidationException("authorization field is required", result.error.issues.map((issue) => {
                    return {
                        key: "headers",
                        path: issue.path.join("."),
                        message: issue.message,
                    };
                }));
            }
            const { user, payload } = await Token.decode({
                authorization: req.headers.authorization,
                tokenType,
            });
            req.user = user;
            req.tokenPayload = payload;
            return next();
        };
    };
    static authorizationMiddleware = ({ accessRoles = [], } = {}) => {
        return async (req, res, next) => {
            if (!accessRoles.includes(req.user?.role ?? "")) {
                throw new ForbiddenException("Not Authorized Account ⛔");
            }
            return next();
        };
    };
    static combined = ({ tokenType = TokenTypesEnum.access, accessRoles = [], }) => {
        return [
            this.authenticationMiddleware({ tokenType }),
            this.authorizationMiddleware({ accessRoles }),
        ];
    };
}
export default Auths;
