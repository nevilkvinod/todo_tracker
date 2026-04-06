"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[calc(100vh-4rem)] bg-background">
      <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        We encountered an issue loading your dashboard analytics. This might be due to a network connection or server error.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline" className="border-border">
          Return Home
        </Button>
        <Button onClick={() => reset()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    </div>
  );
}
