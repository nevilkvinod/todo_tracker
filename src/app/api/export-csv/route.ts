import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7', 10);

    const isManager = session.user.role === 'MANAGER';
    
    // RBAC Validation
    let targetUserId: string | undefined = session.user.id;
    if (isManager) {
        targetUserId = filterUserId === 'all' ? undefined : (filterUserId || undefined);
    } else {
        targetUserId = session.user.id; // Enforce user can only export their own
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const where: any = {
      loginAt: { gte: dateLimit }
    };
    if (targetUserId) {
      where.userId = targetUserId;
    }

    const logs = await prisma.loginActivity.findMany({
      where,
      orderBy: { loginAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    const csvRows = [];
    // User_ID, Date, Check_In_Time, Check_Out_Time, Daily_Total_Duration
    csvRows.push(['User_ID', 'User_Name', 'Date', 'Check_In_Time', 'Check_Out_Time', 'Daily_Total_Duration_Mins']);

    for (const log of logs) {
      const dateStr = new Date(log.loginAt).toLocaleDateString('en-US');
      const inTime = new Date(log.loginAt).toLocaleTimeString('en-US');
      const outTime = log.logoutAt ? new Date(log.logoutAt).toLocaleTimeString('en-US') : 'Active';
      const duration = log.duration ? log.duration.toString() : '';

      csvRows.push([
        log.user.id,
        `"${log.user.name || log.user.email}"`,
        dateStr,
        inTime,
        outTime,
        duration
      ]);
    }

    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="attendance_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (err: any) {
    console.error("[CSV Export Error]", err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
