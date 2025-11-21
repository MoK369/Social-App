import type { Request, Response } from "express";
import { asyncSocketIoServiceHandler } from "../../utils/handlers/async.handler.ts";
import type {
  CreateChatGroupBodyDtoType,
  GetChatGroupParamsDtoType,
  GetChatGroupQueryDtoType,
  GetChatParamsDtoType,
  GetChatQueryDtoType,
  IJoinRoomDto,
  ISayHiDto,
  ISendGroupMessageDto,
  ISendMessageDto,
} from "./chat.dto.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import { UserRepository, ChatRespository } from "../../db/repository/index.ts";
import { UserModel, ChatModel } from "../../db/models/index.ts";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../utils/exceptions/custom.exceptions.ts";
import type {
  ICreateChatGroupResponse,
  IGetChatResponse,
} from "./chat.entities.ts";
import { connectedSockets } from "../gateway/gateway.ts";
import S3Service from "../../utils/multer/s3.service.ts";
import { generateAlphaNumaricId } from "../../utils/security/id.security.ts";

class ChatService {
  private chatRepository = new ChatRespository(ChatModel);
  private userRepository = new UserRepository(UserModel);

  // REST
  getChat = async (req: Request, res: Response): Promise<Response> => {
    const { page, size } = req.query as GetChatQueryDtoType;
    const { userId } = req.params as GetChatParamsDtoType;

    const chat = await this.chatRepository.findOneChatWithMessagePagination({
      filter: {
        participants: {
          $all: [req.user!._id!, Types.ObjectId.createFromHexString(userId)],
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

    return successHandler<IGetChatResponse>({ res, body: { chat } });
  };

  getChatGroup = async (req: Request, res: Response): Promise<Response> => {
    const { page, size } = req.query as GetChatGroupQueryDtoType;
    const { groupId } = req.params as GetChatGroupParamsDtoType;

    const chat = await this.chatRepository.findOneChatWithMessagePagination({
      filter: {
        _id: Types.ObjectId.createFromHexString(groupId),
        participants: {
          $in: [req.user!._id!],
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

    return successHandler<IGetChatResponse>({ res, body: { chat } });
  };

  createChatGroup = async (req: Request, res: Response): Promise<Response> => {
    const { groupName, participants, attachment } =
      req.body as CreateChatGroupBodyDtoType;

    if (participants.includes(req.user!._id!.toString())) {
      throw new BadRequestException(
        "You're by default added to this chat group you can't add yourself again"
      );
    }

    const dbParticipants = participants.map((participant) =>
      Types.ObjectId.createFromHexString(participant)
    );

    const users = await this.userRepository.find({
      filter: { _id: { $in: dbParticipants }, friends: { $in: req.user!._id } },
    });

    if (participants.length !== users.length) {
      throw new NotFoundException("Some ar all participants are invalid");
    }

    const roomId =
      groupName.replaceAll(/\s+/g, "_") + "_" + generateAlphaNumaricId();
    let groupImageSubKey;
    if (attachment) {
      groupImageSubKey = await S3Service.uploadFile({
        File: attachment,
        Path: `chat/${roomId}`,
      });
    }

    dbParticipants.push(req.user!._id!);
    const [chattingGroup] = await this.chatRepository
      .create({
        data: [
          {
            createdBy: req.user!._id!,
            groupName,
            groupImage: groupImageSubKey,
            participants: dbParticipants,
            roomId,
          },
        ],
      })
      .catch(async () => {
        await S3Service.deleteFile({ SubKey: groupImageSubKey! });
        throw new BadRequestException("Failed creating chatting group");
      });

    return successHandler<ICreateChatGroupResponse>({
      res,
      statusCode: 201,
      body: { chattingGroup: chattingGroup! },
    });
  };

  // IO
  sayHi = asyncSocketIoServiceHandler<ISayHiDto>(
    async ({ message, socket, io, callback }) => {
      console.log({ message });
      callback?.("Welcome front-end");
    }
  );

  sendMessage = asyncSocketIoServiceHandler<ISendMessageDto>(
    async ({ content, sendTo, socket, io }): Promise<void> => {
      const createdBy = socket.credentials!.user!._id!;

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

      io.to(connectedSockets.get(createdBy!.toString())!).emit(
        "successMessage",
        { content }
      );

      io.to(connectedSockets.get(sendTo)!).emit("newMessage", {
        content,
        from: socket.credentials!.user!,
      });
    }
  );

  joinRoom = asyncSocketIoServiceHandler<IJoinRoomDto>(
    async ({ roomId, socket, io }): Promise<void> => {
      const chat = await this.chatRepository.findOne({
        filter: {
          roomId,
          groupName: { $exists: true },
          participants: { $in: [socket.credentials!.user!._id!] },
        },
      });

      socket.join(roomId);
      console.log(`joingin roomId ${roomId}`);

      if (!chat) {
        throw new BadRequestException("fail to find matching room");
      }
    }
  );

  sendGroupMessage = asyncSocketIoServiceHandler<ISendGroupMessageDto>(
    async ({ content, groupId, socket, io }): Promise<void> => {
      const createdBy = socket.credentials!.user!._id!;

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

      io.to(connectedSockets.get(createdBy!.toString())!).emit(
        "successMessage",
        { content }
      );

      socket.to(chatGroup.roomId!).emit("newMessage", {
        content,
        from: socket.credentials!.user!,
        groupId,
      });
    }
  );
}

export default ChatService;
