import type { Task, Project } from '@prisma/client';
import { ActionLog } from '@/context/AppContext';

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTrackerData(projects: Project[], tasks: Task[]) {
  const headers = ["Task ID", "Project Name", "Task Title", "Status", "Priority", "Completion %", "Start Date", "End Date"];
  
  const getProjectName = (pid: string) => projects.find(p => p.id === pid)?.name || 'Unknown';
  
  const rows = tasks.map(t => [
    t.id,
    getProjectName(t.projectId),
    `"${t.title.replace(/"/g, '""')}"`, // escape quotes
    t.status,
    t.priority,
    t.completionPercentage,
    t.startDate ? (t.startDate as Date).toISOString().split('T')[0] : '',
    t.endDate ? (t.endDate as Date).toISOString().split('T')[0] : ''
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadCSV(`Tracker_Data_Backup_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}

export function exportActivityLogs(logs: ActionLog[]) {
  const headers = ["Timestamp", "Action", "Project", "Task", "Details"];
  
  const rows = logs.map(l => [
    l.timestamp,
    l.action,
    `"${l.projectName.replace(/"/g, '""')}"`,
    `"${l.taskTitle.replace(/"/g, '""')}"`,
    `"${l.details.replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  downloadCSV(`Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}
