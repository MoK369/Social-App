import { ErrorCodesEnum } from "../constants/enum.constants.js";
import type { IssueObjectType } from "../types/issue.type.ts";

export class ApplicatonException extends Error {
  constructor(
    public code: ErrorCodesEnum,
    public override message: string,
    public statusCode: number = 400,
    public details?: IssueObjectType[],
    public override cause?: unknown
  ) {
    super();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ServerException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.SERVER_ERROR, message, 500, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.INVALID_INPUT, message, 400, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.VALIDATION_ERROR, message, 400, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.RESOURCE_NOT_FOUND, message, 404, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ConflictException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.CONFLICT_ERROR, message, 409, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.UNAUTHORIZED, message, 401, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ForbiddenException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.FORBIDDEN, message, 403, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TooManyRequestsException extends ApplicatonException {
  constructor(message: string, details?: IssueObjectType[], cause?: unknown) {
    super(ErrorCodesEnum.TOO_MANY_RQUESTS, message, 429, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
