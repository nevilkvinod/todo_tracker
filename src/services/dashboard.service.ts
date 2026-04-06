import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, isWithinInterval, format, endOfDay } from 'date-fns';

export interface DashboardFilter {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export class DashboardService {
  /**
   * Generates Top Metrics and Delta percentages based on timelines.
   */
  static async getDashboardMetrics(userId: string, filter: DashboardFilter) {
    const defaultStart = filter.startDate || subDays(new Date(), 30);
    const defaultEnd = filter.endDate || new Date();

    const whereParams: any = {
      project: {
        userProjects: { some: { userId } },
        deletedAt: null
      },
      deletedAt: null
    };

    if (filter.projectId && filter.projectId !== 'all') whereParams.projectId = filter.projectId;
    if (filter.status && filter.status !== 'all') whereParams.status = filter.status;

    // Fetch tasks constrained to filter
    const tasks = await prisma.task.findMany({
      where: whereParams,
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    const activeProjectWhere = {
      userProjects: { some: { userId } },
      deletedAt: null,
      ...(filter.projectId && filter.projectId !== 'all' ? { id: filter.projectId } : {})
    };
    const totalProjects = await prisma.project.count({ where: activeProjectWhere });

    // Aggregate Task counters
    let completedTasks = 0;
    let onHoldTasks = 0;
    let inProgressTasks = 0;

    // We calculate "Mock" sparklines dynamically by seeing how many tasks were created each day recently
    const sparklineData = Array.from({ length: 7 }).map((_, i) => ({
       day: format(subDays(new Date(), 6 - i), 'EEE'),
       value: 0
    }));

    tasks.forEach(t => {
      if (t.status === 'DONE') completedTasks++;
      if (t.status === 'IN_PROGRESS') inProgressTasks++;
      if (t.status === 'REVIEW') onHoldTasks++; // Map REVIEW to On Hold logically

      // Populate sparkline (last 7 days activity)
      const dayIndex = 6 - Math.floor((defaultEnd.getTime() - t.updatedAt.getTime()) / (1000 * 3600 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        sparklineData[dayIndex].value += 1;
      }
    });

    return {
      totalProjects,
      totalTasks: tasks.length,
      completedTasks,
      onHoldTasks,
      inProgressTasks,
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
      sparkline: sparklineData
    };
  }

  /**
   * Generates the grouped bar representations of tasks specifically sectioned per project.
   */
  static async getProjectStatusDistribution(userId: string, filter: DashboardFilter) {
    const projects = await prisma.project.findMany({
      where: { userProjects: { some: { userId } }, deletedAt: null, ...(filter.projectId && filter.projectId !== 'all' ? { id: filter.projectId } : {}) },
      include: {
         tasks: { where: { deletedAt: null } }
      }
    });

    // Donut Chart - Project Status Distribution
    const statusCounts = projects.reduce((acc, proj) => {
      acc[proj.status] = (acc[proj.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Bar Chart - Tasks per Project
    const barData = projects.map(proj => {
      const completed = proj.tasks.filter(t => t.status === 'DONE').length;
      const inProgress = proj.tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;
      const todo = proj.tasks.filter(t => t.status === 'TODO').length;

      return {
        id: proj.id,
        name: proj.name.substring(0, 15) + (proj.name.length > 15 ? '...' : ''),
        Completed: completed,
        'In Progress': inProgress,
        Todo: todo,
      };
    });

    return { pieData, barData };
  }

  /**
   * Generates Daily historical Productivity Lines based on exactly mapped database fields.
   */
  static async getWeeklyProductivity(userId: string, filter: DashboardFilter) {
    const daysToMap = 7;
    const today = startOfDay(new Date());

    const result = Array.from({ length: daysToMap }).map((_, i) => ({
      date: format(subDays(today, daysToMap - 1 - i), 'MMM dd'),
      Completed: 0,
      Created: 0
    }));

    const tasks = await prisma.task.findMany({
      where: {
        project: { userProjects: { some: { userId } }, deletedAt: null },
        deletedAt: null,
        ...(filter.projectId && filter.projectId !== 'all' ? { projectId: filter.projectId } : {})
      },
      select: { status: true, createdAt: true, updatedAt: true }
    });

    tasks.forEach(t => {
      const createdDiff = Math.floor((today.getTime() - startOfDay(t.createdAt).getTime()) / (1000 * 3600 * 24));
      if (createdDiff >= 0 && createdDiff < daysToMap) result[daysToMap - 1 - createdDiff].Created += 1;

      if (t.status === 'DONE') {
        const completedDiff = Math.floor((today.getTime() - startOfDay(t.updatedAt).getTime()) / (1000 * 3600 * 24));
        if (completedDiff >= 0 && completedDiff < daysToMap) result[daysToMap - 1 - completedDiff].Completed += 1;
      }
    });

    return result;
  }

  /**
   * Generates cumulative task trend data for an Area Chart.
   */
  static async getTaskTrendData(userId: string, filter: DashboardFilter) {
    const daysToMap = 7;
    const today = startOfDay(new Date());

    const result = Array.from({ length: daysToMap }).map((_, i) => ({
      date: format(subDays(today, daysToMap - 1 - i), 'MMM dd'),
      Pending: 0,
      Completed: 0
    }));

    const tasks = await prisma.task.findMany({
      where: {
        project: { userProjects: { some: { userId } }, deletedAt: null },
        deletedAt: null,
        ...(filter.projectId && filter.projectId !== 'all' ? { projectId: filter.projectId } : {})
      },
      select: { status: true, createdAt: true, updatedAt: true }
    });

    result.forEach(dayPoint => {
      const dayEnd = endOfDay(new Date(dayPoint.date + `, ${today.getFullYear()}`));
      
      const pending = tasks.filter(t => t.createdAt <= dayEnd && (t.status !== 'DONE' || t.updatedAt > dayEnd)).length;
      const completed = tasks.filter(t => t.status === 'DONE' && t.updatedAt <= dayEnd).length;
      
      dayPoint.Pending = pending;
      dayPoint.Completed = completed;
    });

    return result;
  }
}
