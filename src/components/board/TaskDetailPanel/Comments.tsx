import React, { useState } from 'react';
import type { Comment } from '@prisma/client';
import { useMutateTask } from '@/hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

export function Comments({ taskId, comments }: { taskId: string, comments: any[] }) {
  const { addCommentMutation } = useMutateTask();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate({ taskId, content: newComment.trim() }, {
         onSuccess: () => setNewComment('')
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {(!comments || comments.length === 0) ? (
           <div className="text-center text-muted-foreground text-sm py-8 italic opacity-70">
             No comments yet. Start the conversation!
           </div>
        ) : (
           comments.map(comment => (
             <div key={comment.id} className="flex gap-3">
               {/* Avatar placeholder */}
               <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold uppercase shrink-0">
                  {comment.user?.name?.[0] || comment.user?.email?.[0] || '?'}
               </div>
               <div className="flex-1 space-y-1">
                 <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-foreground">
                       {comment.user?.name || comment.user?.email || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                       {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                 </div>
                 <div className="text-sm bg-secondary/30 p-2.5 rounded-b-lg rounded-tr-lg text-foreground/90 border border-border/50 break-words whitespace-pre-wrap">
                    {comment.content}
                 </div>
               </div>
             </div>
           ))
        )}
      </div>

      <div className="pt-4 border-t border-border mt-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative">
           <textarea 
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
             placeholder="Write a comment..."
             disabled={addCommentMutation.isPending}
             onKeyDown={(e) => {
               if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSubmit(e);
               }
             }}
             className="w-full bg-background border border-border focus:border-primary rounded-lg p-3 text-sm min-h-[80px] max-h-[150px] resize-y outline-none transition-colors"
           />
           <button 
             type="submit" 
             disabled={!newComment.trim() || addCommentMutation.isPending}
             className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-opacity"
           >
             {addCommentMutation.isPending ? 'Sending...' : 'Save'}
           </button>
        </form>
      </div>
    </div>
  );
}
