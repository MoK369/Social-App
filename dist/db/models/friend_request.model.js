import mongoose from "mongoose";
import ModelsNames from "../../utils/constants/models_names.constants.js";
const friendRequestSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: ModelsNames.userModel,
    },
    sentTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: ModelsNames.userModel,
    },
    acceptedAt: {
        type: Date,
    },
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false,
    },
    versionKey: false,
});
const FriendRequestModel = mongoose.models.FriendRequest ||
    mongoose.model(ModelsNames.friendRequestModel, friendRequestSchema);
export default FriendRequestModel;
