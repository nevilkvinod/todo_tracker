import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null }
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null }
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, role: true, image: true }
    });
  }

  static async updateRole(id: string, newRole: Role) {
    return prisma.user.update({
      where: { id },
      data: { role: newRole }
    });
  }
}
