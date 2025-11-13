import { asyncSocketIoServiceHandler } from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import ChatRespository from "../../db/repository/chat.repository.js";
import ChatModel from "../../db/models/chat.model.js";
import UserRepository from "../../db/repository/user.respository.js";
import { UserModel } from "../../db/models/user.model.js";
import { Types } from "mongoose";
import { NotFoundException } from "../../utils/exceptions/custom.exceptions.js";
import { connectedSockets } from "../gateway/gateway.js";
class ChatService {
    chatRepository = new ChatRespository(ChatModel);
    userRepository = new UserRepository(UserModel);
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this.chatRepository.findOne({
            filter: {
                participants: {
                    $all: [req.user._id, Types.ObjectId.createFromHexString(userId)],
                },
                groupName: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "firstName lastName email gender profilePicture",
                    },
                ],
            },
        });
        if (!chat) {
            throw new NotFoundException("Failed to find Matching Chat");
        }
        return successHandler({ res, body: { chat } });
    };
    sayHi = asyncSocketIoServiceHandler(async ({ message, socket, io, callback }) => {
        console.log({ message });
        callback?.("Welcome front-end");
    });
    sendMessage = asyncSocketIoServiceHandler(async ({ content, sendTo, socket, io }) => {
        const createdBy = socket.credentials.user._id;
        const user = await this.userRepository.findOne({
            filter: {
                freezed: { $exists: false },
                _id: Types.ObjectId.createFromHexString(sendTo),
                friends: {
                    $in: createdBy,
                },
            },
        });
        if (!user) {
            throw new NotFoundException("Invalid recipient friend ❌");
        }
        const chat = await this.chatRepository.findOneAndUpdate({
            filter: {
                participants: {
                    $all: [createdBy, Types.ObjectId.createFromHexString(sendTo)],
                },
                groupName: { $exists: false },
            },
            update: {
                $addToSet: { messages: { content, createdBy } },
            },
        });
        if (!chat) {
            await this.chatRepository.create({
                data: [
                    {
                        createdBy,
                        participants: [
                            createdBy,
                            Types.ObjectId.createFromHexString(sendTo),
                        ],
                        messages: [{ content, createdBy }],
                    },
                ],
            });
        }
        io.to(connectedSockets.get(createdBy.toString())).emit("successMessage", { content });
        io.to(connectedSockets.get(sendTo)).emit("newMessage", {
            content,
            from: socket.credentials.user,
        });
    });
}
export default ChatService;
