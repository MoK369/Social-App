import type { Request, Response } from "express";
import { asyncSocketIoServiceHandler } from "../../utils/handlers/async.handler.ts";
import type {
  GetChatParamsDtoType,
  ISayHiDto,
  ISendMessageDto,
} from "./chat.dto.ts";
import successHandler from "../../utils/handlers/success.handler.ts";
import ChatRespository from "../../db/repository/chat.repository.ts";
import ChatModel from "../../db/models/chat.model.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import { UserModel } from "../../db/models/user.model.ts";
import { Types } from "mongoose";
import { NotFoundException } from "../../utils/exceptions/custom.exceptions.ts";
import type { IGetChatResponse } from "./chat.entities.ts";
import { connectedSockets } from "../gateway/gateway.ts";

class ChatService {
  private chatRepository = new ChatRespository(ChatModel);
  private userRepository = new UserRepository(UserModel);

  // REST
  getChat = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as GetChatParamsDtoType;

    const chat = await this.chatRepository.findOne({
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
    });

    if (!chat) {
      throw new NotFoundException("Failed to find Matching Chat");
    }

    return successHandler<IGetChatResponse>({ res, body: { chat } });
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
}

export default ChatService;
