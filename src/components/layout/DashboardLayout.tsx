import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
  isDemoData?: boolean;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPath,
  onNavigate,
  title,
  subtitle,
  isDemoData = false,
  activeSection,
  onSelectSection,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col antialiased text-slate-900">
      {/* Dark Navy Sidebar */}
      <AppSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-200">
        <DashboardHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onNavigate={onNavigate}
          title={title}
          subtitle={subtitle}
          isDemoData={isDemoData}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
