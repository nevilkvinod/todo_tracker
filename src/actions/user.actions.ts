'use server';

import { UserRepository } from '../repositories/user.repository';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { z } from 'zod';
import { Role } from '@prisma/client';

async function requireManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'MANAGER') {
    throw new Error("UNAUTHORIZED: Only managers can perform this action.");
  }
  return session.user;
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
    await requireManager();
    const { name, email, password, role } = CreateUserSchema.parse(data);
    
    // Check if exists
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      // If soft-deleted, maybe we should restore? We'll just generic error for now
      throw new Error("User with this email already exists.");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role
      }
    });
    
    revalidatePath('/manager');
    revalidateTag('users', 'default');
    return { success: true, data: { id: user.id }, error: null };
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

    const user = await UserRepository.softDelete(userId);
    
    revalidatePath('/manager');
    revalidateTag('users', 'default');
    return { success: true, data: user, error: null };
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
