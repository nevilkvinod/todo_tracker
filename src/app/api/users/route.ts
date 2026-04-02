import { NextResponse } from 'next/server';
import { onboardUserToExcel } from '@/utils/excelService';
import { sendNotificationEmail } from '@/utils/mailer';

export async function POST(req: Request) {
  try {
    const user = await req.json();
    
    // 1. Excel Automation - Create Sheet for User
    onboardUserToExcel(user);

    // 2. Email Notification - Send Invite
    const userEmail = `${user.name.split(' ')[0].toLowerCase()}@tracker.local`;
    const subject = `Welcome to Tracker, ${user.name}!`;
    const message = `Hi ${user.name},\n\nYou have been invited to Tracker as a ${user.role}.\nYour starting bandwidth capacity is ${user.bandwidthCapacity} hours/week.\n\nPlease log in to start viewing your assignments.`;
    
    await sendNotificationEmail(userEmail, subject, message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error onboarding user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
