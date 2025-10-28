import type { JwtPayload } from "jsonwebtoken";
import type { HIUser } from "../../db/interfaces/user.interface.ts";

declare module "express-serve-static-core" {
  interface Request {
    user?: HIUser;
    tokenPayload?: JwtPayload;
  }
}
