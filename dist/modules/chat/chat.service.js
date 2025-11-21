import { asyncSocketIoServiceHandler } from "../../utils/handlers/async.handler.js";
import successHandler from "../../utils/handlers/success.handler.js";
import { UserRepository, ChatRespository } from "../../db/repository/index.js";
import { UserModel, ChatModel } from "../../db/models/index.js";
import { Types } from "mongoose";
import { BadRequestException, NotFoundException, } from "../../utils/exceptions/custom.exceptions.js";
import { connectedSockets } from "../gateway/gateway.js";
import S3Service from "../../utils/multer/s3.service.js";
import { generateAlphaNumaricId } from "../../utils/security/id.security.js";
class ChatService {
    chatRepository = new ChatRespository(ChatModel);
    userRepository = new UserRepository(UserModel);
    getChat = async (req, res) => {
        const { page, size } = req.query;
        const { userId } = req.params;
        const chat = await this.chatRepository.findOneChatWithMessagePagination({
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
            page,
            size,
        });
        if (!chat) {
            throw new NotFoundException("Failed to find Matching Chat");
        }
        return successHandler({ res, body: { chat } });
    };
    getChatGroup = async (req, res) => {
        const { page, size } = req.query;
        const { groupId } = req.params;
        const chat = await this.chatRepository.findOneChatWithMessagePagination({
            filter: {
                _id: Types.ObjectId.createFromHexString(groupId),
                participants: {
                    $in: [req.user._id],
                },
                groupName: { $exists: true },
            },
            options: {
                populate: [
                    {
                        path: "messages.createdBy",
                        select: "firstName lastName email gender profilePicture",
                        transform(doc, id) {
                            return doc.toJSON();
                        },
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new NotFoundException("Failed to find Matching Chat");
        }
        return successHandler({ res, body: { chat } });
    };
    createChatGroup = async (req, res) => {
        const { groupName, participants, attachment } = req.body;
        if (participants.includes(req.user._id.toString())) {
            throw new BadRequestException("You're by default added to this chat group you can't add yourself again");
        }
        const dbParticipants = participants.map((participant) => Types.ObjectId.createFromHexString(participant));
        const users = await this.userRepository.find({
            filter: { _id: { $in: dbParticipants }, friends: { $in: req.user._id } },
        });
        if (participants.length !== users.length) {
            throw new NotFoundException("Some ar all participants are invalid");
        }
        const roomId = groupName.replaceAll(/\s+/g, "_") + "_" + generateAlphaNumaricId();
        let groupImageSubKey;
        if (attachment) {
            groupImageSubKey = await S3Service.uploadFile({
                File: attachment,
                Path: `chat/${roomId}`,
            });
        }
        dbParticipants.push(req.user._id);
        const [chattingGroup] = await this.chatRepository
            .create({
            data: [
                {
                    createdBy: req.user._id,
                    groupName,
                    groupImage: groupImageSubKey,
                    participants: dbParticipants,
                    roomId,
                },
            ],
        })
            .catch(async () => {
            await S3Service.deleteFile({ SubKey: groupImageSubKey });
            throw new BadRequestException("Failed creating chatting group");
        });
        return successHandler({
            res,
            statusCode: 201,
            body: { chattingGroup: chattingGroup },
        });
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
    joinRoom = asyncSocketIoServiceHandler(async ({ roomId, socket, io }) => {
        const chat = await this.chatRepository.findOne({
            filter: {
                roomId,
                groupName: { $exists: true },
                participants: { $in: [socket.credentials.user._id] },
            },
        });
        socket.join(roomId);
        console.log(`joingin roomId ${roomId}`);
        if (!chat) {
            throw new BadRequestException("fail to find matching room");
        }
    });
    sendGroupMessage = asyncSocketIoServiceHandler(async ({ content, groupId, socket, io }) => {
        const createdBy = socket.credentials.user._id;
        const chatGroup = await this.chatRepository.findOneAndUpdate({
            filter: {
                _id: Types.ObjectId.createFromHexString(groupId),
                participants: { $in: [createdBy] },
                groupName: { $exists: true },
            },
            update: {
                $addToSet: { messages: { content, createdBy } },
            },
        });
        if (!chatGroup) {
            throw new NotFoundException("Failed to find matching chat group");
        }
        io.to(connectedSockets.get(createdBy.toString())).emit("successMessage", { content });
        socket.to(chatGroup.roomId).emit("newMessage", {
            content,
            from: socket.credentials.user,
            groupId,
        });
    });
}
export default ChatService;
