import mongoose from "mongoose";
import ModelsNames from "../../utils/constants/models_names.constants.js";
const messageSchema = new mongoose.Schema({
    content: { type: String, minLength: 1, maxLength: 1000, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelsNames.userModel,
    },
}, { timestamps: true });
const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: ModelsNames.userModel,
        },
    ],
    messages: {
        type: [messageSchema],
        default: [],
    },
    groupName: {
        type: String,
        minLength: 5,
        maxLength: 100,
    },
    groupImage: String,
    roomId: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: ModelsNames.userModel,
    },
}, {
    timestamps: true,
});
const ChatModel = mongoose.models?.Chat ||
    mongoose.model(ModelsNames.chatModel, chatSchema);
export default ChatModel;
