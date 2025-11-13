import type { IMainDto } from "../../modules/chat/chat.dto.ts";

export const asyncSocketIoServiceHandler = <TArgs extends IMainDto>(
  fn: (args: TArgs) => Promise<void>
) => {
  return async (args: TArgs): Promise<void> => {
    try {
      await fn(args);
    } catch (error) {
      args.socket.emit("custom_error", error);
    }
  };
};
