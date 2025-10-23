import { ErrorCodesEnum } from "../constants/enum.constants.js";
export class ApplicatonException extends Error {
    code;
    message;
    statusCode;
    details;
    cause;
    constructor(code, message, statusCode = 400, details, cause) {
        super();
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.cause = cause;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class BadRequestException extends ApplicatonException {
    constructor(message, details, cause) {
        super(ErrorCodesEnum.INVALID_INPUT, message, 400, details, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationException extends ApplicatonException {
    constructor(message, details, cause) {
        super(ErrorCodesEnum.VALIDATION_ERROR, message, 400, details, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class NotFoundException extends ApplicatonException {
    constructor(notFoundItem, details, cause) {
        super(ErrorCodesEnum.RESOURCE_NOT_FOUND, `${notFoundItem} Not Found`, 404, details, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ConflictException extends ApplicatonException {
    constructor(message, details, cause) {
        super(ErrorCodesEnum.CONFLICT_ERROR, message, 409, details, cause);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
