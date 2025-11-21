import mongoose from "mongoose";
import type {
  IAtByObject,
  ICodExpireCoundObject,
} from "../interfaces/common.interface.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";

export const atByObjectSchema = new mongoose.Schema<IAtByObject>(
  {
    at: { type: Date, required: true },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: ModelsNames.userModel,
    },
  },
  { _id: false }
);

export const codeExpireCountObjectSchema =
  new mongoose.Schema<ICodExpireCoundObject>(
    {
      code: { type: String, required: true },
      expiresAt: { type: Date, require: true },
      count: { type: Number, default: 0 },
    },
    { _id: false }
  );
