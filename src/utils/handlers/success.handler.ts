import type { Response } from "express";

function successHandler<T = any>({
  res,
  statusCode = 200,
  message = "Done ✅",
  body,
}: {
  res: Response;
  statusCode?: number;
  message?: string;
  body?: T;
}): Response<Record<string, any>> {
  
  return res.status(statusCode).json({ success: true, message, body });
}

export default successHandler;
