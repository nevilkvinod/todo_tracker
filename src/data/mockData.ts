import { addDays, subDays } from 'date-fns';

export type TaskStatus = 'Yet to Start' | 'Work in Progress' | 'Final Stage' | 'On Hold' | 'Review' | 'Completed';

export interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'Active' | 'On-Hold' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  completionPercentage: number;
  startDate: string;
  endDate: string;
}

const today = new Date();

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Frontend Refactor', status: 'Active', priority: 'High', startDate: subDays(today, 5).toISOString(), endDate: addDays(today, 20).toISOString(), progress: 45, color: '#3b82f6' },
  { id: 'p2', name: 'Gantt Chart Module', status: 'Active', priority: 'Critical', startDate: today.toISOString(), endDate: addDays(today, 10).toISOString(), progress: 15, color: '#10b981' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't3', projectId: 'p1', title: 'Kanban DND Implementation', status: 'Yet to Start', priority: 'Critical', completionPercentage: 0, startDate: addDays(today, 3).toISOString(), endDate: addDays(today, 5).toISOString() },
  { id: 't4', projectId: 'p2', title: 'Split-Pane Layout', status: 'Work in Progress', priority: 'High', completionPercentage: 40, startDate: today.toISOString(), endDate: addDays(today, 2).toISOString() },
  { id: 't5', projectId: 'p2', title: 'Draggable Task Bars', status: 'Yet to Start', priority: 'Critical', completionPercentage: 0, startDate: addDays(today, 3).toISOString(), endDate: addDays(today, 7).toISOString() },
  { id: 't6', projectId: 'p2', title: 'Zoom Toggle (Day/Week/Month)', status: 'On Hold', priority: 'Low', completionPercentage: 0, startDate: addDays(today, 8).toISOString(), endDate: addDays(today, 10).toISOString() },
  { id: 't7', projectId: 'p1', title: 'Design Review', status: 'Review', priority: 'Medium', completionPercentage: 95, startDate: subDays(today, 2).toISOString(), endDate: today.toISOString() },
];
