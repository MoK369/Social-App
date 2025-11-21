import type { LeanType } from "../types/find_functions.type.ts";
import type { HydratedDocument } from "mongoose";
import type { FlattenMaps, LeanOptions, Require_id } from "mongoose";
import type { IChat } from "../../db/interfaces/chat.interface.ts";
import type { IPaginationMetaData } from "../constants/interface.constants.ts";

export type FindOneChatFunctionsReturnType<Lean extends LeanType> =
  Lean extends true | LeanOptions
    ? Partial<Require_id<FlattenMaps<IChat>> & IPaginationMetaData> | null
    : Partial<HydratedDocument<IChat> & IPaginationMetaData> | null;
