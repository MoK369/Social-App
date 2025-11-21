import type {
  FullIMessage,
  HIChat,
  HIMessage,
  IChat,
  IMessage,
} from "../interfaces/chat.interface.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import KeyUtil from "../../utils/multer/key.multer.ts";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: { type: String, minLength: 1, maxLength: 1000, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelsNames.userModel,
    },
  },
  { timestamps: true }
);

messageSchema.methods.toJSON = function () {
  const { _id, ...restObject } = (this as HIMessage).toObject();

  return {
    id: _id,
    ...restObject,
  };
};

const chatSchema = new mongoose.Schema<IChat>(
  {
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
  },
  {
    timestamps: true,
  }
);

chatSchema.methods.toJSON = function () {
  const { _id, ...restObject } = (this as HIChat).toObject();

  const newMessages = [];
  if (restObject.messages?.length) {
    for (let message of restObject.messages) {
      const { _id, ...restMessageObject } = message as FullIMessage;
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
          host: process.env.HOST!,
          protocol: process.env.PROTOCOL!,
        },
        subKey: ret.groupImage,
      });
    }
    return ret;
  },
});

const ChatModel =
  (mongoose.models?.Chat as mongoose.Model<IChat>) ||
  mongoose.model<IChat>(ModelsNames.chatModel, chatSchema);

export default ChatModel;
