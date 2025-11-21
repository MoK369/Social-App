import mongoose, { Model } from "mongoose";
import ModelsNames from "../../utils/constants/models_names.constants.js";
import { atByObjectSchema } from "./common.model.js";
import UserRepository from "../repository/user.respository.js";
import { UserModel } from "./user.model.js";
import emailEvent from "../../utils/events/email.event.js";
import { EmailEventsEnum, TaggedInEnum, } from "../../utils/constants/enum.constants.js";
import GetFullUrl from "../../utils/url/get_full.url.js";
const commentSchema = new mongoose.Schema({
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
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: {
        type: [String],
        required: function () {
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
}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
commentSchema.post("save", async function () {
    console.log({ doc: this });
    if (this.tags?.length) {
        const userRepository = new UserRepository(UserModel);
        const taggingUser = (await userRepository.findById({
            id: this.createdBy,
            projection: { firstName: 1, lastName: 1 },
        }))?.toJSON();
        const tagedUsers = await userRepository.find({
            filter: { _id: { $in: this.tags } },
            projection: { email: 1 },
        });
        for (const user of tagedUsers) {
            emailEvent.publish({
                eventName: EmailEventsEnum.tagNotifyingEmail,
                payload: {
                    to: user.email,
                    taggingUser: taggingUser.fullName,
                    taggedIn: TaggedInEnum.comment,
                },
            });
        }
    }
});
commentSchema.pre(["find", "findOne", "findOneAndUpdate", "updateOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid == false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezed: { $exists: false } });
    }
    next();
});
commentSchema.virtual("reply", {
    localField: "_id",
    foreignField: "commentId",
    ref: ModelsNames.commentModel,
    justOne: true,
});
commentSchema.methods.toJSON = function () {
    const { _id, ...restObject } = this.toObject();
    if (restObject?.attachments) {
        restObject.attachments = GetFullUrl.getFullUrlOfAttachments(restObject.attachments);
    }
    return {
        id: _id,
        ...restObject,
    };
};
const CommentModel = mongoose.models.Comment ||
    mongoose.model(ModelsNames.commentModel, commentSchema);
export default CommentModel;
