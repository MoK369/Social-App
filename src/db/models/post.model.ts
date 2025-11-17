import mongoose from "mongoose";
import type { IPost } from "../interfaces/post.interface.ts";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  EmailEventsEnum,
} from "../../utils/constants/enum.constants.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import { atByObjectSchema } from "./common.model.ts";
import { UserRepository } from "../repository/index.ts";
import { UserModel } from "./user.model.ts";
import emailEvent from "../../utils/events/email.event.ts";

const postSchema = new mongoose.Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
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
  {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

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
        },
      });
    }
  }
});

postSchema.pre(
  ["find", "findOne", "findOneAndUpdate", "updateOne"],
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

const PostModel =
  (mongoose.models.PostModel as mongoose.Model<IPost>) ||
  mongoose.model<IPost>(ModelsNames.postModel, postSchema);

export default PostModel;
