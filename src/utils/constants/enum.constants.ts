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
  ASSET_ERROR = "ASSET_ERROR",
}

export enum EmailEventsEnum {
  verifyEmail = "verifyEmail",
  resetPassword = "resetPassword",
  enableTwoFactor = "enableTwoFactorAuth",
  loginWithTwoFactor = "loginWithTwoFactor",
}

export enum S3EventsEnum {
  trackProfileImageUpload = "trackProfileImageUpload",
  trackCoverImageUpload = "trackCoverImageUpload",
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
  enableTwoFactor = "EnalbeTwoFactorAuth",
  loginWithTwoFactor = "LoginWithTwoFactorAuth",
}

export enum EmailStatusEnum {
  notConfirmed = "NotConfirmed",
  confirmed = "Confirmed",
}

export enum StorageTypesEnum {
  memory = "Memory",
  disk = "Disk",
}
