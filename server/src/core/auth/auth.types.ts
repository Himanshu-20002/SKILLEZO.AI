import { UserRole, AccountStatus } from "@/core/constants/enums";

export interface AuthenticatedUserContext {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: AccountStatus;
}
