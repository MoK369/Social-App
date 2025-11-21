import mongoose from "mongoose";
import type { HIPost, IPost } from "../interfaces/post.interface.ts";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  EmailEventsEnum,
  TaggedInEnum,
} from "../../utils/constants/enum.constants.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import { atByObjectSchema } from "./common.model.ts";
import { UserRepository } from "../repository/index.ts";
import { UserModel } from "./user.model.ts";
import emailEvent from "../../utils/events/email.event.ts";
import GetFullUrl from "../../utils/url/get_full.url.ts";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
      required: function (this: IPost) {
        return !this.attachments?.length;
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
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

postSchema.methods.toJSON = function () {
  console.log({ post: this });
  const { _id, assetsFolderId, ...restObject } = (this as HIPost).toObject();

  if (restObject?.attachments) {
    restObject.attachments = GetFullUrl.getFullUrlOfAttachments(
      restObject.attachments
    );
  }

  return {
    id: _id,
    ...restObject,
  };
};

// sending notifiying emails to tagged users
postSchema.post("save", async function () {
  console.log({ doc: this });
  if (this.tags?.length) {
    const userRepository = new UserRepository(UserModel);
    const taggingUser = (
      await userRepository.findById({
        id: this.createdBy,
        projection: { firstName: 1, lastName: 1 },
      })
    )?.toJSON();

    const tagedUsers = await userRepository.find({
      filter: { _id: { $in: this.tags } },
      projection: { email: 1 },
    });

    for (const user of tagedUsers) {
      emailEvent.publish({
        eventName: EmailEventsEnum.tagNotifyingEmail,
        payload: {
          to: user!.email,
          taggingUser: taggingUser!.fullName!,
          taggedIn: TaggedInEnum.post,
        },
      });
    }
  }
});

postSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "updateOne", "countDocuments"],
  function (next) {
    const query = this.getQuery();
    if (query.paranoid == false) {
      this.setQuery({ ...query });
    } else {
      this.setQuery({ ...query, freezed: { $exists: false } });
    }

    next();
  }
);

// postSchema._id = commentSchema.postId
postSchema.virtual("comments", {
  localField: "_id",
  foreignField: "postId",
  ref: ModelsNames.commentModel,
  justOne: true,
});

const PostModel =
  (mongoose.models.PostModel as mongoose.Model<IPost>) ||
  mongoose.model<IPost>(ModelsNames.postModel, postSchema);

export default PostModel;
