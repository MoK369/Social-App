import mongoose from "mongoose";
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
        ref: "User",
        required: true,
    },
}, { timestamps: true });
const RevokedTokenModel = mongoose.models.RevokedToken ||
    mongoose.model("RevokedToken", revokedTokenSchema);
export default RevokedTokenModel;
