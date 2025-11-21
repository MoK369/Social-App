import ModelsNames from "../../utils/constants/models_names.constants.js";
import KeyUtil from "../../utils/multer/key.multer.js";
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    content: { type: String, minLength: 1, maxLength: 1000, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelsNames.userModel,
    },
}, { timestamps: true });
messageSchema.methods.toJSON = function () {
    const { _id, ...restObject } = this.toObject();
    return {
        id: _id,
        ...restObject,
    };
};
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
        maxLength: 500,
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
chatSchema.methods.toJSON = function () {
    const { _id, ...restObject } = this.toObject();
    const newMessages = [];
    if (restObject.messages?.length) {
        for (let message of restObject.messages) {
            const { _id, ...restMessageObject } = message;
            newMessages.push({ id: _id, ...restMessageObject });
        }
    }
    restObject.messages = newMessages;
    return {
        id: _id,
        ...restObject,
    };
};
chatSchema.set("toObject", {
    transform: (doc, ret) => {
        if (ret?.groupImage) {
            ret.groupImage = KeyUtil.generateS3UploadsUrlFromSubKey({
                req: {
                    host: process.env.HOST,
                    protocol: process.env.PROTOCOL,
                },
                subKey: ret.groupImage,
            });
        }
        return ret;
    },
});
const ChatModel = mongoose.models?.Chat ||
    mongoose.model(ModelsNames.chatModel, chatSchema);
export default ChatModel;
