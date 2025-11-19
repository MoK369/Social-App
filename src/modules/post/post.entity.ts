import type {
  FindFunctionOptionsType,
  LeanType,
} from "../../utils/types/find_functions.type.ts";
import type { IUser } from "../../db/interfaces/user.interface.ts";

export interface IGetPostListResponse<TLean extends LeanType = false> {
  docsCount?: number | undefined;
  totalPages?: number | undefined;
  currentPage?: number | undefined;
  size?: number | undefined;
  data: FindFunctionOptionsType<IUser, TLean>;
}
