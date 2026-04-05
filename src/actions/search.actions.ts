'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

export async function searchUsersAction(query: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Allow managers and users to search
  // But maybe limit what users see (for now just active users)
  
  if (!query || query.length < 2) return { success: true, data: [] };

  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error("[Search Users Error]:", error);
    return { success: false, data: null, error: "Failed to search users" };
  }
}
