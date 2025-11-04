import type { HIUser } from "../../db/interfaces/user.interface.ts";
import type { ITokenPayload } from "../constants/interface.constants.ts";
import type { KeyReqType } from "../constants/types.constants.ts";
declare module "express-serve-static-core" {
  interface Request {
    user?: HIUser;
    tokenPayload?: ITokenPayload;
    validationResult: Partial<Record<KeyReqType, any>>;
  }
}
