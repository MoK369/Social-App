import DatabaseRepository from "./database.repository.js";
import { BadRequestException } from "../../utils/exceptions/custom.exceptions.js";
class ChatRespository extends DatabaseRepository {
    constructor(chatModel) {
        super(chatModel);
    }
    findOneChatWithMessagePagination = async ({ filter, projection = {}, options = {}, page = 1, size = 5, }) => {
        page = Math.floor(!page || page < 1 ? 1 : page);
        size = Math.floor(!size || size < 1 ? 5 : size);
        const totalCount = (await this.model.aggregate([
            {
                $match: { ...filter }
            },
            {
                $project: {
                    _id: 0,
                    size: { $size: "$messages" },
                },
            },
        ]))[0].size;
        console.log({ totalCount });
        const result = await this.model.findOne(filter, {
            ...projection,
            messages: { $slice: [-(page * size), size] },
        }, options);
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
