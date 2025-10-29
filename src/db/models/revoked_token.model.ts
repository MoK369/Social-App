import mongoose from "mongoose";
import type { IRevokedToken } from "../interfaces/revoked_token.interface.ts";

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
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const RevokedTokenModel =
  mongoose.models.RevokedToken ||
  mongoose.model<IRevokedToken>("RevokedToken", revokedTokenSchema);

export default RevokedTokenModel;
