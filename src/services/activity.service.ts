import { prisma } from '@/lib/prisma';

export class ActivityService {

  /**
   * Get Current Active Session
   */
  static async getActiveSession(userId: string) {
    if (!userId) throw new Error("Validation Error: User.id is missing or null");

    return await prisma.loginActivity.findFirst({
      where: {
        userId,
        logoutAt: null
      },
      orderBy: { loginAt: 'desc' }
    });
  }

  /**
   * Start a new Manual Shift (Clock In)
   */
  static async checkIn(userId: string) {
    if (!userId) throw new Error("Validation Error: User.id is missing or null");

    const active = await ActivityService.getActiveSession(userId);
    if (active) throw new Error("Already clocked in. Cannot double-dip shifts.");

    return await prisma.loginActivity.create({
      data: {
        userId,
        loginAt: new Date()
      }
    });
  }

  /**
   * Complete a session (Clock Out)
   */
  static async checkOut(userId: string) {
    if (!userId) throw new Error("Validation Error: User.id is missing or null");

    const activity = await ActivityService.getActiveSession(userId);

    if (!activity) throw new Error("No active session found to clock out of.");

    const logoutAt = new Date();
    const durationMs = logoutAt.getTime() - activity.loginAt.getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    return await prisma.loginActivity.update({
      where: { id: activity.id },
      data: {
        logoutAt,
        duration: durationMinutes,
      }
    });
  }

  /**
   * Get filtered logs with pagination
   */
  static async getLogs({
    userId,
    days = 7,
    page = 1,
    limit = 20
  }: {
    userId?: string;
    days?: number;
    page?: number;
    limit?: number;
  }) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const where: any = {
      loginAt: { gte: dateLimit }
    };
    
    if (userId) {
      where.userId = userId;
    }

    const logs = await prisma.loginActivity.findMany({
      where,
      orderBy: { loginAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true, image: true } }
      }
    });

    const totalCount = await prisma.loginActivity.count({ where });

    return {
      data: logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Get basic stats for cards
   */
  static async getStats({ userId, days = 7 }: { userId?: string; days?: number }) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const where: any = {
      loginAt: { gte: dateLimit }
    };
    if (userId) {
      where.userId = userId;
    }

    const activities = await prisma.loginActivity.findMany({ where });

    let totalDuration = 0;
    let activeSessions = 0;
    // We determine distinct active days
    const uniqueDays = new Set<string>();

    for (const act of activities) {
      if (act.duration) {
        totalDuration += act.duration;
      }
      
      if (!act.logoutAt) {
        activeSessions++;
      }

      const dayStr = act.loginAt.toISOString().split('T')[0];
      uniqueDays.add(dayStr);
    }

    const totalHours = totalDuration / 60;
    const avgHoursPerDay = uniqueDays.size > 0 ? totalHours / uniqueDays.size : 0;

    return {
      totalHours: parseFloat(totalHours.toFixed(1)),
      avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(1)),
      activeSessions,
      daysTracked: uniqueDays.size
    };
  }

  /**
   * Get today's activity for the timeline visualizer
   */
  static async getTodayTimeline(userId?: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const where: any = {
      loginAt: { gte: startOfToday }
    };
    if (userId) {
      where.userId = userId;
    }

    return await prisma.loginActivity.findMany({
      where,
      orderBy: { loginAt: 'asc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
  }
}
