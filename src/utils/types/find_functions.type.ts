import type {
  FlattenMaps,
  Require_id,
  HydratedDocument,
  QueryOptions,
} from "mongoose";

export type FindFunctionOptionsType<TDocument, TLean> =
  QueryOptions<TDocument> & {
    lean?: TLean;
  };

export type FindFunctionsReturnType<
  T,
  Lean extends boolean
> = Lean extends true
  ? Require_id<FlattenMaps<T>> | null
  : HydratedDocument<T> | null;
