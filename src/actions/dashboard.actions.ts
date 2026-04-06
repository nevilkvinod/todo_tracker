"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { DashboardService, DashboardFilter } from '@/services/dashboard.service';

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function fetchDashboardMetricsAction(filter: DashboardFilter = {}) {
  try {
    const user = await requireAuth();
    const data = await DashboardService.getDashboardMetrics(user.id, filter);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProjectDistributionAction(filter: DashboardFilter = {}) {
  try {
    const user = await requireAuth();
    const data = await DashboardService.getProjectStatusDistribution(user.id, filter);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchWeeklyProductivityAction(filter: DashboardFilter = {}) {
  try {
    const user = await requireAuth();
    const data = await DashboardService.getWeeklyProductivity(user.id, filter);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchTaskTrendDataAction(filter: DashboardFilter = {}) {
  try {
    const user = await requireAuth();
    const data = await DashboardService.getTaskTrendData(user.id, filter);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
