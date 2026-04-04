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
