import type { Response } from "express";

function successHandler({
  res,
  statusCode = 200,
  message,
  body,
}: {
  res: Response;
  statusCode?: number;
  message?: string;
  body?: object;
}): Response<Record<string, any>> {
  return res.status(statusCode).json({ success: true, message, body });
}

export default successHandler;
