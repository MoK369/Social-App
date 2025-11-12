import mongoose from "mongoose";
import type { IFriendRequest } from "../interfaces/friend_request.interface.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";

const friendRequestSchema = new mongoose.Schema<IFriendRequest>(
  {
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
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  }
);

const FriendRequestModel =
  (mongoose.models.FriendRequest as mongoose.Model<IFriendRequest>) ||
  mongoose.model<IFriendRequest>(
    ModelsNames.friendRequestModel,
    friendRequestSchema
  );

export default FriendRequestModel;
