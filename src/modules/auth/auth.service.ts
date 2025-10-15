import type { Request, Response } from "express";

class AuthenticationService {
  signup = async (req: Request, res: Response): Promise<Response> => {
    return res
      .status(201)
      .json({ message: "User signed up successfully", body: req.body });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    return res
      .json({ message: "User logged in successfully", body: req.body });
  };
}

export default new AuthenticationService();
