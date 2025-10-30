export enum MoodEnum {
  DEVELOPMENT = "Development",
  PRODUCTION = "Production",
}

export enum GenderEnum {
  MALE = "Male",
  Female = "Female",
}

export enum UserRoleEnum {
  USER = "User",
  ADMIN = "Admin",
}

export enum ErrorCodesEnum {
  SERVER_ERROR = "SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_PARAMETERS = "MISSING_PARAMETERS",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  CONFLICT_ERROR = "CONFLICT_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOO_MANY_RQUESTS = "TOO_MANY_REQUESTS",
}

export enum EventsEnum {
  verifyEmail = "verifyEmail",
  resetPassword = "resetPassword",
}

export enum SignatureLevelsEnum {
  Bearer = "Bearer",
  System = "System",
}

export enum TokenTypesEnum {
  access = "Access",
  refresh = "Refresh",
}

export enum LogoutStatusEnum {
  one = "One",
  all = "All",
}

export enum OTPTypesEnum {
  confirmEmailOTP = "ConfirmEmailOTP",
  forgetPasswordOTP = "ForgetPasswordOTP",
}

export enum EmailStatusEnum {
  notConfirmed = "NotConfirmed",
  confirmed = "Confirmed",
}
