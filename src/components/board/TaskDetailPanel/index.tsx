import React, { useState } from 'react';
import type { Task, Project } from '@prisma/client';
import { X, MessageSquare, Activity, Loader2 } from 'lucide-react';
import { useTaskDetails } from '@/hooks/useTasks';
import { TaskHeader } from './TaskHeader';
import { TaskDetails } from './TaskDetails';
import { Subtasks } from './Subtasks';
import { Comments } from './Comments';
import { History } from './History';

interface TaskDetailPanelProps {
  task: (Task & { subtasks?: any[], comments?: any[], history?: any[], assignee?: any }) | null;
  projects?: Project[];
  users?: any[];
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailPanel({ task: initialTask, isOpen, onClose, users }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const { data: detailedTask, isLoading } = useTaskDetails(isOpen ? (initialTask?.id || null) : null);

  const task = detailedTask || initialTask;

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full md:w-[85%] max-w-6xl bg-card border-l border-border shadow-2xl flex flex-col transition-transform transform translate-x-0"
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Details (70%) */}
          <div className="w-full md:w-[70%] flex flex-col h-full bg-background/50 overflow-y-auto px-8 py-6">
            <TaskHeader task={task} />
            <div className="space-y-8 pb-12">
               <TaskDetails task={task} users={users || []} />
               <Subtasks taskId={task.id} subtasks={task.subtasks || []} />
            </div>
          </div>

          {/* RIGHT COLUMN: Activity Panel (30%) */}
          <div className="hidden md:flex flex-col w-[30%] h-full bg-secondary/10 border-l border-border">
             {/* Close Button & Tab Header */}
             <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex bg-secondary/50 rounded-lg p-1">
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'comments' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <MessageSquare size={14} /> Comments
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Activity size={14} /> History
                  </button>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
             </div>

             {/* Tab Content */}
             <div className="flex-1 overflow-y-auto p-4 relative">
                {isLoading && !detailedTask ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                   </div>
                ) : null}
                {activeTab === 'comments' ? (
                   <Comments taskId={task.id} comments={task.comments || []} />
                ) : (
                   <History history={task.history || []} />
                )}
             </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
