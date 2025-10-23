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

export class BadRequestException extends ApplicatonException {
  constructor(
    message: string,
    details?: IssueObjectType[],
    cause?: unknown
  ) {
    super(ErrorCodesEnum.INVALID_INPUT, message, 400, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends ApplicatonException {
  constructor(
    message: string,
    details?: IssueObjectType[],
    cause?: unknown
  ) {
    super(ErrorCodesEnum.VALIDATION_ERROR, message, 400, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundException extends ApplicatonException {
  constructor(
    notFoundItem: string,
    details?: IssueObjectType[],
    cause?: unknown
  ) {
    super(ErrorCodesEnum.RESOURCE_NOT_FOUND, `${notFoundItem} Not Found`, 404, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ConflictException extends ApplicatonException {
  constructor(
    message: string,
    details?: IssueObjectType[],
    cause?: unknown
  ) {
    super(ErrorCodesEnum.CONFLICT_ERROR, message, 409, details, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
