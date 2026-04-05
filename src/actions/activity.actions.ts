'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { ActivityService } from "@/services/activity.service";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function getActiveSessionAction() {
  try {
    const user = await requireAuth();
    const data = await ActivityService.getActiveSession(user.id);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clockInAction() {
  try {
    const user = await requireAuth();
    const data = await ActivityService.checkIn(user.id);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clockOutAction() {
  try {
    const user = await requireAuth();
    const data = await ActivityService.checkOut(user.id);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActivityStatsAction(filterUserId?: string, days: number = 7) {
  try {
    const user = await requireAuth();
    
    // RBAC: users can only see their own
    if (user.role !== 'MANAGER') {
      filterUserId = user.id; 
    } else if (filterUserId === 'all') {
      filterUserId = undefined; // manager wants all
    }

    const data = await ActivityService.getStats({ userId: filterUserId, days });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActivityLogsAction(filterUserId?: string, days: number = 7, page: number = 1) {
  try {
    const user = await requireAuth();
    
    // RBAC
    if (user.role !== 'MANAGER') {
      filterUserId = user.id; 
    } else if (filterUserId === 'all') {
      filterUserId = undefined; 
    }

    const data = await ActivityService.getLogs({ userId: filterUserId, days, page, limit: 15 });
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTodayTimelineAction(filterUserId?: string) {
  try {
    const user = await requireAuth();
    
    // RBAC
    if (user.role !== 'MANAGER') {
      filterUserId = user.id; 
    } else if (filterUserId === 'all') {
      filterUserId = undefined; 
    }

    const data = await ActivityService.getTodayTimeline(filterUserId);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
