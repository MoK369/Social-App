import { UserRoleEnum } from "../../utils/constants/enum.constants.js";
const userAuthorizationEndpoints = {
    restoreAccount: [UserRoleEnum.ADMIN],
    deleteAccount: [UserRoleEnum.ADMIN],
};
export default userAuthorizationEndpoints;
