import { BaseRepository } from "../base";
import { UserModel, IUser } from "@/database/models/User.model";
import { AccountStatus } from "@/core/constants/enums";
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(UserModel, "User");
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email: email.toLowerCase().trim() });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({ email: email.toLowerCase().trim() });
  }

  async findActiveUser(id: string): Promise<IUser | null> {
    return await this.findOne({ _id: id, accountStatus: AccountStatus.ACTIVE });
  }

  async verifyEmail(id: string): Promise<IUser | null> {
    return await this.updateById(id, { emailVerified: true });
  }

  async updateLastLogin(id: string): Promise<IUser | null> {
    return await this.updateById(id, { lastLoginAt: new Date() });
  }

  async changeAccountStatus(id: string, accountStatus: AccountStatus): Promise<IUser | null> {
    return await this.updateById(id, { accountStatus });
  }
}
