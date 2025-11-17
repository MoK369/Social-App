import mongoose from "mongoose";
import type { IPost } from "../interfaces/post.interface.ts";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
} from "../../utils/constants/enum.constants.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import { atByObjectSchema } from "./common.model.ts";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 5,
      maxLength: 10000,
      required: function (this: IPost) {
        return !this.allowComments?.length;
      },
    },
    attachments: {
      type: [String],
      required: function (this: IPost) {
        return !this.content?.length;
      },
    },
    assetsFolderId: { type: String, required: true },

    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.public,
    },
    allowComments: {
      type: String,
      enum: Object.values(AllowCommentsEnum),
      default: AllowCommentsEnum.allow,
    },

    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: ModelsNames.userModel },
    ],
    tags: [
      { type: mongoose.Schema.Types.ObjectId, ref: ModelsNames.userModel },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelsNames.userModel,
      required: true,
    },
    freezed: atByObjectSchema,
    restored: atByObjectSchema,
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

const PostModel =
  (mongoose.models.PostModel as mongoose.Model<IPost>) ||
  mongoose.model<IPost>(ModelsNames.postModel, postSchema);

export default PostModel;
