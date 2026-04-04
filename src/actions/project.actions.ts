'use server';

import { ProjectService } from '../services/project.service';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { z } from 'zod';

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

const ProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'CANCELLED', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional()
});

export async function fetchProjectsAction() {
  try {
    const user = await requireAuth();
    const projects = await ProjectService.getProjects(user.id, user.role as string);
    return { success: true, data: projects, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function createProjectAction(data: any) {
  try {
    const user = await requireAuth();
    const parsedData = ProjectSchema.parse(data);
    const project = await ProjectService.createProject(parsedData, user.id, user.role as string);
    revalidatePath('/');
    revalidatePath('/manager');
    revalidatePath('/board');
    revalidateTag('projects');
    return { success: true, data: project, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function updateProjectAction(id: string, data: any) {
  try {
    const user = await requireAuth();
    const parsedData = ProjectSchema.partial().parse(data);
    const project = await ProjectService.updateProject(id, parsedData, user.id, user.role as string);
    revalidatePath('/');
    revalidatePath('/manager');
    revalidatePath('/board');
    revalidateTag('projects');
    return { success: true, data: project, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const user = await requireAuth();
    const project = await ProjectService.deleteProject(id, user.id, user.role as string);
    revalidatePath('/');
    revalidatePath('/manager');
    revalidatePath('/board');
    revalidateTag('projects');
    return { success: true, data: project, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

const AssignSchema = z.object({
  projectId: z.string().cuid(),
  assigneeId: z.string().cuid()
});

export async function assignProjectAction(data: any) {
  try {
    const user = await requireAuth();
    const { projectId, assigneeId } = AssignSchema.parse(data);
    await ProjectService.assignUser(projectId, assigneeId, user as any);
    revalidatePath('/manager');
    revalidateTag('projects');
    return { success: true, data: null, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}
