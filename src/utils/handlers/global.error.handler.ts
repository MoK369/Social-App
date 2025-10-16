import type { NextFunction, Request, Response } from "express";

interface IError extends Error {
  statusCode?: number;
}

const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    errorMessage: err.message || "Something went wrong! 🤔",
    error: err,
  });
};

export default globalErrorHandler;
