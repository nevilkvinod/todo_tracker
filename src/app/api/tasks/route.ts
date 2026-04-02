import { NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/utils/mailer';
import { logUserActivity } from '@/utils/excelService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task, type, userName } = body;

    if (type === 'ASSIGNMENT') {
      // Simulate fetching user email via assigneeId
      // In a real app we'd query the DB for the user's email.
      // Since we just have the task object in our context, we'll send a general notification for demo
      const userEmail = `assignee-${task.assigneeId || 'unassigned'}@tracker.local`;

      const subject = `New Task Assigned: ${task.title}`;
      const message = `You have been assigned a new task:\n\nTitle: ${task.title}\nPriority: ${task.priority}\nEffort: ${task.effort} hrs.\nDue Date: ${new Date(task.dueDate).toDateString()}`;

      await sendNotificationEmail(userEmail, subject, message);
    }
    else if (type === 'LOG_ACTIVITY' && userName) {
      logUserActivity(userName, task.id, "Logged Activity", `Work activity logged for task ${task.title}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling task tracking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
