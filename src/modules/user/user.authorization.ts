import { UserRoleEnum } from "../../utils/constants/enum.constants.ts";

const userAuthorizationEndpoints = {
  restoreAccount: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
  deleteAccount: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
  dashboard: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
  changeRole: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN],
};

export default userAuthorizationEndpoints;
