import DatabaseRepository from "./database.repository.ts";
import type { IChat as TDocument } from "../interfaces/chat.interface.ts";
import type { Model, RootFilterQuery } from "mongoose";
import type { FindFunctionOptionsType } from "../../utils/types/find_functions.type.ts";
import { BadRequestException } from "../../utils/exceptions/custom.exceptions.ts";
import type { FindOneChatFunctionsReturnType } from "../../utils/types/find_one_chat_with_pagination.type.ts";
import type { ProjectionObjectType } from "../../utils/types/project_object.type.ts";

class ChatRespository extends DatabaseRepository<TDocument> {
  constructor(chatModel: Model<TDocument>) {
    super(chatModel);
  }

  findOneChatWithMessagePagination = async <TLean extends boolean = false>({
    filter,
    projection = {},
    options = {},
    page = 1,
    size = 5,
  }: {
    filter?: RootFilterQuery<TDocument>;
    projection?: ProjectionObjectType<TDocument>;
    options?: FindFunctionOptionsType<TDocument, TLean>;
    page?: number | undefined;
    size?: number | undefined;
  }): Promise<FindOneChatFunctionsReturnType<TLean>> => {
    page = Math.floor(!page || page < 1 ? 1 : page);
    size = Math.floor(!size || size < 1 ? 5 : size);

    const totalCount = (
      (
        await this.model.aggregate([
          {
            $match: {...filter}
          },
          {
            $project: {
              _id: 0,
              size: { $size: "$messages" },
            },
          },
        ])
      )[0] as { size: number }
    ).size;    

    const result = await this.model.findOne(
      filter,
      {
        ...projection,
        messages: { $slice: [-(page * size), size] },
      },
      options
    );
    if (!result) {
      throw new BadRequestException("failed to find matching chat");
    }
    const { messages, ...rest } = result.toJSON();
    return {
      ...rest,
      totalCount,
      totalPages: Math.ceil(totalCount / size),
      currentPage: page,
      size,
      messages,
    };
  };
}

export default ChatRespository;
