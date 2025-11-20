import mongoose, { Model } from "mongoose";
import type { IComment } from "../interfaces/comment.interface.ts";
import ModelsNames from "../../utils/constants/models_names.constants.ts";
import { atByObjectSchema } from "./common.model.ts";
import UserRepository from "../repository/user.respository.ts";
import { UserModel } from "./user.model.ts";
import emailEvent from "../../utils/events/email.event.ts";
import {
  EmailEventsEnum,
  TaggedInEnum,
} from "../../utils/constants/enum.constants.ts";

const commentSchema = new mongoose.Schema<IComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelsNames.postModel,
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelsNames.commentModel,
    },

    content: {
      type: String,
      minLength: 2,
      maxLength: 1000,
      required: function (this: IComment) {
        return !this.attachments?.length;
      },
    },
    attachments: {
      type: [String],
      required: function (this: IComment) {
        return !this.content?.length;
      },
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
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// sending notifiying emails to tagged users
commentSchema.post("save", async function () {
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
          taggedIn: TaggedInEnum.comment,
        },
      });
    }
  }
});

commentSchema.pre(
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

// commentSchema._id = commentSchema.commentId
commentSchema.virtual("reply", {
  localField: "_id",
  foreignField: "commentId",
  ref: ModelsNames.commentModel,
  justOne: true,
});


const CommentModel =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>(ModelsNames.commentModel, commentSchema);

export default CommentModel;
