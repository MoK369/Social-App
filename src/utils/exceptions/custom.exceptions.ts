export class ApplicatonException extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
    public override cause?: unknown
  ) {
    super();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends ApplicatonException {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundException extends ApplicatonException {
  constructor(notFoundItem: string, cause?: unknown) {
    super(`${notFoundItem} Not Found`, 404, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
export class ConflictException extends ApplicatonException {
  constructor(message: string, cause?: unknown) {
    super(message, 409, cause);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}