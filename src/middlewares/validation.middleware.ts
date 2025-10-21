import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { BadRequestException } from "../utils/exceptions/custom.exceptions.ts";

type KeyReqType = keyof Request; // 'body' | 'params' | 'header'
type SchemaType = Partial<Record<KeyReqType, ZodType>>;
type IsssueObjectType = {
  path: string | number | symbol | undefined;
  message: string;
};

const validationMiddleware = (schema: SchemaType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let validationError: Partial<Record<KeyReqType, IsssueObjectType[]>> = {};

    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;
      const validationResult = await schema[key].safeParseAsync(req[key]);
      if (!validationResult.success) {
        validationError[key] = validationResult.error.issues.map(
          (issue): IsssueObjectType => {
            return {
              path: issue.path.join("."),
              message: issue.message,
            };
          }
        );
      }
    }

    if (Object.keys(validationError).length > 0) {
      throw new BadRequestException("Validation Error", validationError);
    }

    return next();
  };
};

export default validationMiddleware;
