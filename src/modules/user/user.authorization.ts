import { UserRoleEnum } from "../../utils/constants/enum.constants.ts";

const userAuthorizationEndpoints = {
  restoreAccount: [UserRoleEnum.ADMIN],
  deleteAccount: [UserRoleEnum.ADMIN],
};

export default userAuthorizationEndpoints;
