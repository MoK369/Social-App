import type { AnyObject, ExclusionProjection } from "mongoose";
import type { InclusionProjection } from "mongoose";

export type ProjectionObjectType<T> =
  | (InclusionProjection<T> & AnyObject)
  | (ExclusionProjection<T> & AnyObject);