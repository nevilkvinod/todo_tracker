import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConflictModalProps {
  isOpen: boolean;
  cloudTimestamp?: string;
  localTimestamp?: string;
  onResolve: (choice: 'cloud' | 'local') => void;
}

export function ConflictModal({ isOpen, cloudTimestamp, localTimestamp, onResolve }: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg border-red-500/50 bg-card">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle /> Sync Conflict Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The data on GitHub appears to be newer or modified from another device, but you also have unsynced local changes. Please chose which version to keep.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-secondary/30 border border-border rounded-lg p-3 text-sm flex flex-col gap-2 relative">
              <span className="font-semibold text-primary">Cloud Version</span>
              <span className="text-[10px] text-muted-foreground">
                Last modified:<br/>
                {cloudTimestamp ? new Date(cloudTimestamp).toLocaleString() : 'Unknown'}
              </span>
              <Button size="sm" onClick={() => onResolve('cloud')} className="mt-2 w-full">Keep Cloud</Button>
            </div>

            <div className="bg-secondary/30 border border-border rounded-lg p-3 text-sm flex flex-col gap-2">
              <span className="font-semibold">Local Version</span>
              <span className="text-[10px] text-muted-foreground">
                Last modified:<br/>
                {localTimestamp ? new Date(localTimestamp).toLocaleString() : 'Unknown'}
              </span>
              <Button size="sm" variant="outline" onClick={() => onResolve('local')} className="mt-2 w-full">Keep Local</Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
