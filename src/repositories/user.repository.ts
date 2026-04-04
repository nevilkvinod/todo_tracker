import { prisma } from "@/lib/prisma";
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

  static async getAllUsers(limit: number = 50) {
    return prisma.user.findMany({
      where: { deletedAt: null },
      take: limit,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        image: true,
        userProjects: {
          include: { project: true }
        }
      }
    });
  }

  static async updateRole(id: string, newRole: Role) {
    return prisma.user.update({
      where: { id },
      data: { role: newRole }
    });
  }

  static async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
