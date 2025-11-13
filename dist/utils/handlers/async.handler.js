export const asyncSocketIoServiceHandler = (fn) => {
    return async (args) => {
        try {
            await fn(args);
        }
        catch (error) {
            args.socket.emit("custom_error", error);
        }
    };
};
