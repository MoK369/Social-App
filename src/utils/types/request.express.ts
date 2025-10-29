import type { JwtPayload } from "jsonwebtoken";
import type { HIUser } from "../../db/interfaces/user.interface.ts";
import type { KeyReqType } from "../constants/types.constants.ts";
declare module "express-serve-static-core" {
  interface Request {
    user?: HIUser;
    tokenPayload?: JwtPayload;
    validationResult: Partial<
      Record<KeyReqType, any>
    >;
  }
}
