import mongoose from "mongoose";
import type { IRevokedToken } from "../interfaces/revoked_token.interface.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";

const revokedTokenSchema = new mongoose.Schema<IRevokedToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresIn: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelsNames.userModel,
      required: true,
    },
  },
  { timestamps: true }
);

const RevokedTokenModel =
  mongoose.models.RevokedToken ||
  mongoose.model<IRevokedToken>(
    ModelsNames.revokedTokenModel,
    revokedTokenSchema
  );

export default RevokedTokenModel;
