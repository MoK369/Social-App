import type { KeyReqType } from "../constants/types.constants.ts";

export type IssueObjectType = {
  key: KeyReqType;
  path: string; //| number | symbol | undefined;
  message: string;
};
