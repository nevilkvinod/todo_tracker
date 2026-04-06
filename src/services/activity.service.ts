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

    return prisma.$transaction(async (tx) => {
      const active = await tx.loginActivity.findFirst({
        where: { userId, logoutAt: null },
        orderBy: { loginAt: 'desc' },
      });
      if (active) throw new Error("Already clocked in. Cannot double-dip shifts.");

      return tx.loginActivity.create({
        data: {
          userId,
          loginAt: new Date()
        }
      });
    });
  }

  /**
   * Complete a session (Clock Out)
   */
  static async checkOut(userId: string) {
    if (!userId) throw new Error("Validation Error: User.id is missing or null");

    return prisma.$transaction(async (tx) => {
      const activity = await tx.loginActivity.findFirst({
        where: { userId, logoutAt: null },
        orderBy: { loginAt: 'desc' },
      });

      if (!activity) throw new Error("No active session found to clock out of.");

      const logoutAt = new Date();
      const durationMs = logoutAt.getTime() - activity.loginAt.getTime();
      const durationSeconds = Math.floor(durationMs / 1000);

      return tx.loginActivity.update({
        where: { id: activity.id },
        data: {
          logoutAt,
          duration: durationSeconds,
        }
      });
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

    let totalDurationSeconds = 0;
    let activeSessions = 0;
    // We determine distinct active days
    const uniqueDays = new Set<string>();

    for (const act of activities) {
      if (act.logoutAt) {
        totalDurationSeconds += Math.floor((act.logoutAt.getTime() - act.loginAt.getTime()) / 1000);
      } else if (act.duration) {
        // Fallback if data is weird
        totalDurationSeconds += act.duration;
      }
      
      if (!act.logoutAt) {
        activeSessions++;
      }

      const dayStr = act.loginAt.toISOString().split('T')[0];
      uniqueDays.add(dayStr);
    }

    const tHours = Math.floor(totalDurationSeconds / 3600);
    const tMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const tSeconds = totalDurationSeconds % 60;
    const totalHoursStr = `${tHours}h ${tMinutes}m ${tSeconds}s`;

    const totalHoursFloat = totalDurationSeconds / 3600;
    const avgHoursPerDay = uniqueDays.size > 0 ? totalHoursFloat / uniqueDays.size : 0;

    return {
      totalHoursStr,
      totalHours: parseFloat(totalHoursFloat.toFixed(2)),
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
