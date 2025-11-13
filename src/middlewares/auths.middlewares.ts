import type { NextFunction, Request, Response } from "express";
import {
  TokenTypesEnum,
  UserRoleEnum,
} from "../utils/constants/enum.constants.ts";
import Token from "../utils/security/token.security.ts";
import { z } from "zod";
import {
  ForbiddenException,
  ValidationException,
} from "../utils/exceptions/custom.exceptions.ts";

class Auths {
  static authenticationMiddleware = ({
    tokenType = TokenTypesEnum.access,
  }: {
    tokenType?: TokenTypesEnum;
  } = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const schema = z.object({
        authorization: z.string().regex(/^(Bearer|System)\ .*\..*\..*$/),
      });
      const result = await schema.safeParseAsync(req.headers);
      if (!result.success) {
        throw new ValidationException(
          "authorization field is required",
          result.error.issues.map((issue) => {
            return {
              key: "headers",
              path: issue.path.join("."),
              message: issue.message,
            };
          })
        );
      }

      const { user, payload } = await Token.decode({
        authorization: req.headers.authorization!,
        tokenType,
      });

      req.user = user;
      req.tokenPayload = payload;

      return next();
    };
  };

  static authorizationMiddleware = ({
    accessRoles = [],
  }: {
    accessRoles?: UserRoleEnum[];
  } = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!accessRoles.includes(req.user?.role ?? ("" as UserRoleEnum))) {
        throw new ForbiddenException("Not Authorized Account ⛔");
      }
      return next();
    };
  };

  static combined = ({
    tokenType = TokenTypesEnum.access,
    accessRoles = [],
  }: {
    tokenType?: TokenTypesEnum;
    accessRoles?: UserRoleEnum[];
  }) => {
    return [
      this.authenticationMiddleware({ tokenType }),
      this.authorizationMiddleware({ accessRoles }),
    ];
  };
}

export default Auths;
