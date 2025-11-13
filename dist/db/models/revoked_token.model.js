import mongoose from "mongoose";
import ModelsNames from "../../utils/constants/models_names.constants.js";
const revokedTokenSchema = new mongoose.Schema({
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
}, { timestamps: true });
const RevokedTokenModel = mongoose.models.RevokedToken ||
    mongoose.model(ModelsNames.revokedTokenModel, revokedTokenSchema);
export default RevokedTokenModel;
