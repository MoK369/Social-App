import mongoose from "mongoose";
import { AllowCommentsEnum, AvailabilityEnum, EmailEventsEnum, TaggedInEnum, } from "../../utils/constants/enum.constants.js";
import ModelsNames from "../../utils/constants/models_names.constants.js";
import { atByObjectSchema } from "./common.model.js";
import { UserRepository } from "../repository/index.js";
import { UserModel } from "./user.model.js";
import emailEvent from "../../utils/events/email.event.js";
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 20000,
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
}, {
    timestamps: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
postSchema.post("save", async function () {
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
                    taggedIn: TaggedInEnum.post,
                },
            });
        }
    }
});
postSchema.pre(["find", "findOne", "findOneAndUpdate", "updateOne", "countDocuments"], function (next) {
    const query = this.getQuery();
    if (query.paranoid == false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezed: { $exists: false } });
    }
    next();
});
postSchema.virtual("comments", {
    localField: "_id",
    foreignField: "postId",
    ref: ModelsNames.commentModel,
    justOne: true,
});
const PostModel = mongoose.models.PostModel ||
    mongoose.model(ModelsNames.postModel, postSchema);
export default PostModel;
