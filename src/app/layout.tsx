import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import AuthProvider from "@/components/providers/SessionProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import { ProjectService } from "@/services/project.service";
import { TaskService } from "@/services/task.service";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tracker - Project Management",
  description: "High-performance project management web application.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  let projects: any[] = [];
  let tasks: any[] = [];

  if (session?.user) {
    try {
      projects = await ProjectService.getProjects(session.user.id, session.user.role as string);
      const projectIds = projects.map(p => p.id);
      if (projectIds.length > 0) {
        tasks = await TaskService.getTasksForProjects(projectIds, session.user.id, session.user.role as string);
      }
    } catch (e) {
      console.error("Layout data fetch error:", e);
    }
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex h-screen overflow-hidden`}
      >
        <AuthProvider>
          <AppProvider initialProjects={projects} initialTasks={tasks}>
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
