import type { NextFunction, Request, Response } from "express";
import { TokenTypesEnum } from "../utils/constants/enum.constants.js";
import Token from "../utils/security/token.security.ts";
import { z } from "zod";
import { ValidationException } from "../utils/exceptions/custom.exceptions.ts";

const authenticationMiddleware = ({
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

    res.locals.user = user;
    res.locals.payload = payload;

    next();
  };
};

export default authenticationMiddleware;
