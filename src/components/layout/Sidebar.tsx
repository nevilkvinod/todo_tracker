"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Calendar,
  Settings,
  Activity,
  LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/utils/cn';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Board', href: '/board', icon: KanbanSquare },
  { name: 'Gantt Chart', href: '/timeline', icon: Activity },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/login') return null;

  const resolvedNavItems = [...navItems];
  if (session?.user?.role === 'MANAGER') {
    resolvedNavItems.push({ name: 'Manager', href: '/manager', icon: Users });
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-card border-r border-border text-card-foreground">
      <div className="p-6 flex items-center space-x-3">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">Tracker.</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
        {resolvedNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {session?.user ? (
          <div className="flex flex-col space-y-3">
            <div className="px-3">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-3 w-full rounded-md px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
