export class ApplicatonException extends Error {
    message;
    statusCode;
    cause;
    constructor(message, statusCode = 400, cause) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.cause = cause;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
