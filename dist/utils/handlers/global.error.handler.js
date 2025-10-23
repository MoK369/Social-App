import { ErrorCodesEnum } from "../constants/enum.constants.js";
const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    console.error({ err });
    console.error({ message: err.message });
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.code || ErrorCodesEnum.SERVER_ERROR,
            message: err.message || "Something went wrong! 🤔",
            details: err.details,
            cause: err.cause,
        },
    });
};
export default globalErrorHandler;
