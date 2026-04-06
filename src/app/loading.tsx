import React from 'react';

export default function Loading() {
  return (
    <div className="flex-col md:flex h-full overflow-y-auto pb-10 bg-background pt-6 p-8">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <div className="h-8 w-48 bg-white/5 animate-pulse rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-white/5 animate-pulse rounded-md"></div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
           <div key={i} className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         <div className="h-[380px] bg-white/5 animate-pulse rounded-xl border border-white/10" />
         <div className="h-[380px] bg-white/5 animate-pulse rounded-xl border border-white/10" />
      </div>
    </div>
  );
}
