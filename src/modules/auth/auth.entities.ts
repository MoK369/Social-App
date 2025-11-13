import type { IUser } from "../../db/interfaces/user.interface.ts";

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}
