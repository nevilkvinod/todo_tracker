import { UserRepository } from "@/repositories/user.repository";
import { Role } from "@prisma/client";

export class UserService {
  static async getAllUsers(currentUser: { id: string, role: string }) {
    if (currentUser.role !== 'MANAGER') {
      throw new Error("UNAUTHORIZED: Only managers can view all users");
    }
    return UserRepository.getAllUsers();
  }

  static async updateUserRole(userId: string, newRole: Role, currentUser: { id: string, role: string }) {
    if (currentUser.role !== 'MANAGER') {
      throw new Error("UNAUTHORIZED: Only managers can update roles");
    }
    return UserRepository.updateRole(userId, newRole);
  }
}
