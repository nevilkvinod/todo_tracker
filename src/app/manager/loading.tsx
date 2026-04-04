'use client';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center p-12 h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-3 text-lg text-muted-foreground animate-pulse">Loading dashboard...</span>
    </div>
  );
}
