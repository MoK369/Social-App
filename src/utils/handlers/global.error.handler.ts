import type { NextFunction, Request, Response } from "express";
import type { IssueObjectType } from "../types/issue.type.ts";
import { ErrorCodesEnum } from "../constants/enum.constants.js";

interface IError extends Error {
  code?: ErrorCodesEnum;
  statusCode?: number;
  details?: IssueObjectType[];
}

const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  console.error({ err });
  console.error({ message: err.message });

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || ErrorCodesEnum.SERVER_ERROR,
      message: err.message || "Something went wrong! 🤔",
      details: err.details,
      cause: err.cause,
    },
  });
};

export default globalErrorHandler;
