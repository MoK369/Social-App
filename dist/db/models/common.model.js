import mongoose from "mongoose";
import ModelsNames from "../../utils/constants/models_names.constants.js";
export const atByObjectSchema = new mongoose.Schema({
    at: { type: Date, required: true },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: ModelsNames.userModel,
    },
}, { _id: false });
export const codeExpireCountObjectSchema = new mongoose.Schema({
    code: { type: String, required: true },
    expiresAt: { type: Date, require: true },
    count: { type: Number, default: 0 },
}, { _id: false });
