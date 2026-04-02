'use server';

import { ProjectService } from '../services/project.service';
import { revalidatePath } from 'next/cache';

const projectService = new ProjectService();

export async function fetchProjectsAction() {
  try {
    const projects = await projectService.getProjects();
    return { success: true, data: projects };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProjectAction(data: any) {
  try {
    const project = await projectService.createProject(data);
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectAction(id: string, data: any) {
  try {
    const project = await projectService.updateProject(id, data);
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const project = await projectService.deleteProject(id);
    revalidatePath('/');
    return { success: true, data: project };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
