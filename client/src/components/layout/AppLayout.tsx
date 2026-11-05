import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopNavbar } from './TopNavbar';
import { QuickPersonaBar } from './QuickPersonaBar';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <QuickPersonaBar />
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <ErrorBoundary fallbackTitle="Module Render Error">
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Global Footer */}
        <footer className="py-4 px-6 border-t border-border/40 text-center text-xs text-text-muted flex items-center justify-between">
          <span className="font-mono text-[11px]">RESISYNC — Smart Residential ERP & Operations Network</span>
          <span className="hidden sm:inline text-text-muted">
            {user?.society?.name ? `${user.society.name} • ${user.society.city || 'Smart Community'}` : 'Decentralized Multi-Tenant Architecture'}
          </span>
        </footer>
      </div>
    </div>
  );
};

