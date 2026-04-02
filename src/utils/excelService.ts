import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Define the root storage directory for reports
const REPORTS_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(REPORTS_DIR, 'team_reports.xlsx');

/**
 * Initializes the reports directory and generic workbook if it doesn't exist.
 */
function ensureStorage() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(REPORTS_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["Global Logging Initialized", new Date().toISOString()]]);
    XLSX.utils.book_append_sheet(wb, ws, "Initialization");
    XLSX.writeFile(wb, REPORTS_FILE);
  }
}

/**
 * Adds a new sheet for a newly onboarded user.
 */
export function onboardUserToExcel(user: { id: string, name: string, role: string }) {
  ensureStorage();
  
  const wb = XLSX.readFile(REPORTS_FILE);
  
  // Create a safe sheet name (Excel limits to 31 chars, no special characters usually)
  const sheetName = user.name.slice(0, 31).replace(/[\\/*?:[\]]/g, '');
  
  if (!wb.SheetNames.includes(sheetName)) {
    const wsData = [
      ["User ID", "Name", "Role", "Date Onboarded"],
      [user.id, user.name, user.role, new Date().toISOString()],
      [],
      ["Task Activity Log:"],
      ["Date", "Task ID", "Action", "Notes"]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, REPORTS_FILE);
    console.log(`[ExcelService] Created new reporting sheet for ${user.name}`);
  }
}

/**
 * Appends an activity log to a specific user's sheet.
 */
export function logUserActivity(userName: string, taskId: string, action: string, notes: string) {
  try {
    ensureStorage();
    const wb = XLSX.readFile(REPORTS_FILE);
    const sheetName = userName.slice(0, 31).replace(/[\\/*?:[\]]/g, '');
    
    if (wb.SheetNames.includes(sheetName)) {
      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      data.push([new Date().toISOString(), taskId, action, notes]);
      
      const newWs = XLSX.utils.aoa_to_sheet(data);
      wb.Sheets[sheetName] = newWs;
      XLSX.writeFile(wb, REPORTS_FILE);
      console.log(`[ExcelService] Logged activity for ${userName}: ${action}`);
    }
  } catch (error) {
    console.error("[ExcelService] Failed to log activity:", error);
  }
}
