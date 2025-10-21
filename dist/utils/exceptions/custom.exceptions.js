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
export class BadRequestException extends ApplicatonException {
    constructor(message, cause) {
        super(message, 400, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundException extends ApplicatonException {
    constructor(notFoundItem, cause) {
        super(`${notFoundItem} Not Found`, 404, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ConflictException extends ApplicatonException {
    constructor(message, cause) {
        super(message, 409, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
