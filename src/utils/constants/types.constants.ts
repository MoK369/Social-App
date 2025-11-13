import type { Request } from "express";
import type { ZodType } from "zod";

export type KeyReqType = keyof Request; // 'body' | 'params' | 'header'
export type ZodSchemaType = Partial<Record<KeyReqType, ZodType>>;