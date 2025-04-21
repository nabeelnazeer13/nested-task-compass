
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useTaskContext } from '@/context/TaskContext';
import ProjectView from '@/components/projects/ProjectView';
import CalendarView from '@/components/calendar/CalendarView';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { selectedView } = useTaskContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center border-b">
            <SidebarTrigger />
            <h1 className="text-2xl font-semibold ml-4">Quire Clone</h1>
          </div>
          <main className="flex-1 overflow-auto p-4">
            {selectedView === 'projects' ? <ProjectView /> : <CalendarView />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
