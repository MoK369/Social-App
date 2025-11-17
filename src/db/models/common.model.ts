import mongoose from "mongoose";
import type { IAtByObject } from "../interfaces/common.interface.ts";
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
