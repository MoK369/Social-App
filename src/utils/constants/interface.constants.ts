import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

export interface ITokenPayload extends JwtPayload{
  id: Types.ObjectId;
}
