import { ActivityDashboard } from '@/components/activity/ActivityDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Activity | Tracker',
};

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <div className="flex gap-4">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium">
            Status: On Duty
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <ActivityDashboard userRole={session.user.role} userId={session.user.id} />
      </main>
    </div>
  );
}
