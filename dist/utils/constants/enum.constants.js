export var MoodEnum;
(function (MoodEnum) {
    MoodEnum["DEVELOPMENT"] = "Development";
    MoodEnum["PRODUCTION"] = "Production";
})(MoodEnum || (MoodEnum = {}));
export var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "Male";
    GenderEnum["Female"] = "Female";
})(GenderEnum || (GenderEnum = {}));
export var UserRoleEnum;
(function (UserRoleEnum) {
    UserRoleEnum["USER"] = "User";
    UserRoleEnum["ADMIN"] = "Admin";
})(UserRoleEnum || (UserRoleEnum = {}));
export var ErrorCodesEnum;
(function (ErrorCodesEnum) {
    ErrorCodesEnum["SERVER_ERROR"] = "SERVER_ERROR";
    ErrorCodesEnum["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCodesEnum["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCodesEnum["MISSING_PARAMETERS"] = "MISSING_PARAMETERS";
    ErrorCodesEnum["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ErrorCodesEnum["CONFLICT_ERROR"] = "CONFLICT_ERROR";
    ErrorCodesEnum["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCodesEnum["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodesEnum["TOO_MANY_RQUESTS"] = "TOO_MANY_REQUESTS";
    ErrorCodesEnum["ASSET_ERROR"] = "ASSET_ERROR";
})(ErrorCodesEnum || (ErrorCodesEnum = {}));
export var EmailEventsEnum;
(function (EmailEventsEnum) {
    EmailEventsEnum["verifyEmail"] = "verifyEmail";
    EmailEventsEnum["resetPassword"] = "resetPassword";
    EmailEventsEnum["enableTwoFactor"] = "enableTwoFactorAuth";
    EmailEventsEnum["loginWithTwoFactor"] = "loginWithTwoFactor";
    EmailEventsEnum["tagNotifyingEmail"] = "tagNotifyingEmail";
})(EmailEventsEnum || (EmailEventsEnum = {}));
export var S3EventsEnum;
(function (S3EventsEnum) {
    S3EventsEnum["trackProfileImageUpload"] = "trackProfileImageUpload";
    S3EventsEnum["trackCoverImageUpload"] = "trackCoverImageUpload";
})(S3EventsEnum || (S3EventsEnum = {}));
export var SignatureLevelsEnum;
(function (SignatureLevelsEnum) {
    SignatureLevelsEnum["Bearer"] = "Bearer";
    SignatureLevelsEnum["System"] = "System";
})(SignatureLevelsEnum || (SignatureLevelsEnum = {}));
export var TokenTypesEnum;
(function (TokenTypesEnum) {
    TokenTypesEnum["access"] = "Access";
    TokenTypesEnum["refresh"] = "Refresh";
})(TokenTypesEnum || (TokenTypesEnum = {}));
export var LogoutStatusEnum;
(function (LogoutStatusEnum) {
    LogoutStatusEnum["one"] = "One";
    LogoutStatusEnum["all"] = "All";
})(LogoutStatusEnum || (LogoutStatusEnum = {}));
export var OTPTypesEnum;
(function (OTPTypesEnum) {
    OTPTypesEnum["confirmEmailOTP"] = "ConfirmEmailOTP";
    OTPTypesEnum["forgetPasswordOTP"] = "ForgetPasswordOTP";
    OTPTypesEnum["enableTwoFactor"] = "EnalbeTwoFactorAuth";
    OTPTypesEnum["loginWithTwoFactor"] = "LoginWithTwoFactorAuth";
})(OTPTypesEnum || (OTPTypesEnum = {}));
export var EmailStatusEnum;
(function (EmailStatusEnum) {
    EmailStatusEnum["notConfirmed"] = "NotConfirmed";
    EmailStatusEnum["confirmed"] = "Confirmed";
})(EmailStatusEnum || (EmailStatusEnum = {}));
export var StorageTypesEnum;
(function (StorageTypesEnum) {
    StorageTypesEnum["memory"] = "Memory";
    StorageTypesEnum["disk"] = "Disk";
})(StorageTypesEnum || (StorageTypesEnum = {}));
export var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["allow"] = "Allow";
    AllowCommentsEnum["deny"] = "Deny";
})(AllowCommentsEnum || (AllowCommentsEnum = {}));
export var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["public"] = "Public";
    AvailabilityEnum["friends"] = "Friends";
    AvailabilityEnum["onlyMe"] = "OnlyMe";
})(AvailabilityEnum || (AvailabilityEnum = {}));
export var LikeActionsEnum;
(function (LikeActionsEnum) {
    LikeActionsEnum["like"] = "Like";
    LikeActionsEnum["unlike"] = "Unlike";
})(LikeActionsEnum || (LikeActionsEnum = {}));
