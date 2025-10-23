function successHandler({ res, statusCode = 200, message, body, }) {
    return res.status(statusCode).json({ success: true, message, body });
}
export default successHandler;
