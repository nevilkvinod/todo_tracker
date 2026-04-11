'use server';

import { UserRepository } from '../repositories/user.repository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { z } from 'zod';
import { Role } from '@prisma/client';

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED: No session found.");
  }
  
  // Directly verify against DB to prevent stale JWT abuse
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || dbUser.role !== 'MANAGER') {
     throw new Error("UNAUTHORIZED: Only managers can perform this action.");
  }
  
  return dbUser;
}

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role).optional().default('USER'),
});

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function createUserAction(data: any) {
  try {
    const currentUser = await requireManager();
    const { name, email, password, role } = CreateUserSchema.parse(data);
    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Process inside a transaction to prevent race conditions
    const finalUserId = await prisma.$transaction(async (tx) => {
      // a. Check if an active user exists by email FIRST
      const activeUser = await tx.user.findFirst({ 
        where: { email: normalizedEmail, deletedAt: null } 
      });
      
      if (activeUser) {
        throw new Error("User with this email already exists.");
      }
      
      // b. Check if a soft-deleted user exists by email
      const softDeletedUser = await tx.user.findFirst({
        where: { email: normalizedEmail, deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' }
      });
      
      if (softDeletedUser) {
        // c. RESTORE user
        const restoredUser = await tx.user.update({
          where: { id: softDeletedUser.id },
          data: {
            name,
            password: hashedPassword,
            role,
            deletedAt: null
          }
        });
        
        // Clear or detach old relations (tasks/projects/assignments) to prevent data leakage
        await tx.userProject.deleteMany({ where: { userId: softDeletedUser.id } });
        await tx.task.updateMany({ 
          where: { assigneeId: softDeletedUser.id }, 
          data: { assigneeId: null } 
        });
        
        // Log restoration explicitly
        await tx.auditLog.create({
          data: {
            action: 'RESTORE_USER',
            userId: currentUser.id,
            targetId: restoredUser.id,
            targetEmail: normalizedEmail,
            metadata: { message: "User account restored overriding soft delete" }
          }
        });
        
        return restoredUser.id;
      }
      
      // d. If not exists -> create new user normally
      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role
        }
      });
      
      // Log creation
      await tx.auditLog.create({
        data: {
          action: 'CREATE_USER',
          userId: currentUser.id,
          targetId: newUser.id,
          targetEmail: normalizedEmail,
          metadata: { message: "New user created" }
        }
      });
      
      return newUser.id;
    });
    
    revalidatePath('/manager');
    revalidateTag('users', 'default');
    return { success: true, data: { id: finalUserId }, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

const RoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.nativeEnum(Role)
});

export async function updateUserRoleAction(data: any) {
  try {
    await requireManager();
    const { userId, role } = RoleSchema.parse(data);
    
    // We can use a transaction natively in the service/repo or just direct call
    const user = await UserRepository.updateRole(userId, role);
    
    revalidatePath('/manager');
    revalidateTag('users', 'default');
    return { success: true, data: user, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

const DeleteSchema = z.object({
  userId: z.string().cuid()
});

export async function deleteUserAction(data: any) {
  try {
    const currentUser = await requireManager();
    const { userId } = DeleteSchema.parse(data);
    
    if (currentUser.id === userId) {
      throw new Error("Cannot delete yourself.");
    }

    const deletedUser = await prisma.$transaction(async (tx) => {
      // Perform soft delete
      const user = await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
      });
      
      // Immediately create audit log entry
      await tx.auditLog.create({
        data: {
          action: 'DELETE_USER',
          userId: currentUser.id,
          targetId: userId,
          targetEmail: user.email,
          metadata: { message: "User soft deleted" }
        }
      });
      
      return user;
    });
    
    revalidatePath('/manager');
    revalidateTag('users', 'default');
    return { success: true, data: deletedUser, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function searchUsersAction(query: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    // allow both USER and MANAGER to search users (for assignments)
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, email: true },
      take: 10
    });
    return { success: true, data: users, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function getProjectUsersAction(projectId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    // Get users strictly assigned to this project
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        userProjects: {
          some: { projectId }
        }
      },
      select: { id: true, name: true, email: true }
    });
    return { success: true, data: users, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
