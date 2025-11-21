import type { UpdateWithAggregationPipeline } from "mongoose";
import type { UpdateQuery } from "mongoose";

export type UpdateType = Record<string, any> | Array<Record<string, any>>;

export type UpdateFunctionsUpdateObjectType<
  T,
  Update extends UpdateType
> = Update extends Array<any> ? UpdateWithAggregationPipeline : UpdateQuery<T>;
