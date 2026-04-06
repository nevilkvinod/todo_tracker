"use client";

import React, { Suspense } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { DashboardAdvancedAnalytics } from "@/components/dashboard/DashboardAdvancedAnalytics";
import { ActivityLogWidget } from "@/components/dashboard/ActivityLogWidget";
import { GanttChart } from "@/components/timeline/GanttChart";
import { ProjectsListPanel } from "@/components/dashboard/ProjectsListPanel";
import { motion } from "framer-motion";
import type { Project, Task } from '@prisma/client';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

export default function DashboardClient({ initialProjects, initialTasks }: { initialProjects: Project[], initialTasks: Task[] }) {
  return (
    <div className="flex-col md:flex h-full overflow-y-auto pb-10 bg-background text-foreground">
      <div className="flex-1 space-y-6 p-8 pt-6 max-w-7xl mx-auto w-full">
        
        {/* We use React Suspense boundary because DashboardHeader uses next/navigation's useSearchParams */}
        <Suspense fallback={<div className="h-20 animate-pulse bg-white/5 rounded-xl border border-white/10" />}>
          <DashboardHeader initialProjects={initialProjects} initialTasks={initialTasks} />
        </Suspense>
        
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
          className="space-y-6"
        >
          {/* Core Metrics */}
          <motion.div variants={itemVariants}>
            <Suspense fallback={<div className="h-32 bg-white/5 animate-pulse rounded-xl border border-white/10" />}>
               <DashboardMetrics />
            </Suspense>
          </motion.div>
          
          {/* Main Analytics: Setup as a grid */}
          <motion.div variants={itemVariants}>
             <Suspense fallback={<div className="h-96 bg-white/5 animate-pulse rounded-xl border border-white/10" />}>
                <DashboardAnalytics />
             </Suspense>
          </motion.div>

          <motion.div variants={itemVariants}>
             <Suspense fallback={<div className="h-96 bg-white/5 animate-pulse rounded-xl border border-white/10" />}>
               <DashboardAdvancedAnalytics />
             </Suspense>
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-1 lg:grid-cols-12 mt-6">
            
            {/* Timeline View */}
            <div className="col-span-1 lg:col-span-8 rounded-xl border border-white/10 bg-card/60 backdrop-blur-md p-6 min-h-[400px] shadow-lg">
               <GanttChart initialProjects={initialProjects} initialTasks={initialTasks} />
            </div>

            {/* Activity Log Panel */}
            <div className="col-span-1 lg:col-span-4 rounded-xl border border-white/10 bg-card/60 backdrop-blur-md flex flex-col overflow-hidden max-h-[600px] shadow-lg">
               <ActivityLogWidget />
            </div>

          </motion.div>

          {/* Additional bottom row if needed */}
          <motion.div variants={itemVariants} className="mt-6">
             <ProjectsListPanel initialProjects={initialProjects} onEditProject={() => {}} />
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
