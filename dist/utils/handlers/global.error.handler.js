const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        errorMessage: err.message || "Something went wrong! 🤔",
        error: err,
    });
};
export default globalErrorHandler;
