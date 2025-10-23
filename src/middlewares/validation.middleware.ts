import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import {ValidationException } from "../utils/exceptions/custom.exceptions.ts";
import type { IssueObjectType } from "../utils/types/issue.type.ts";

type KeyReqType = keyof Request; // 'body' | 'params' | 'header'
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

const validationMiddleware = (schema: SchemaType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let validationError: { message: string; details: IssueObjectType[] } = {
      message: "",
      details: [],
    };

    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;
      const validationResult = await schema[key].safeParseAsync(req[key]);
      if (!validationResult.success) {
        validationError.details.push(
          ...validationResult.error.issues.map((issue): IssueObjectType => {
            validationError.message += !validationError.message.length
              ? issue.message
              : ".\n" + issue.message;
            return {
              path: issue.path.join("."),
              message: issue.message,
            };
          })
        );
      }
    }

    if (validationError.message.length > 0) {
      throw new ValidationException(
        validationError.message,
        validationError.details
      );
    }

    return next();
  };
};

export default validationMiddleware;
