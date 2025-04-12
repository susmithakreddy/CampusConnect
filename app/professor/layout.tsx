'use client';

import { ReactNode } from 'react';
import ProfessorSidebar from './components/ProfessorSidebar';
import ProfileDropdown from '@/app/components/ProfileDropdown';

export default function ProfessorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <ProfessorSidebar />

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-h-screen bg-gray-100">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 bg-gray-50 border-b h-16">
          <h2 className="text-2xl font-bold text-gray-700">Professor Dashboard</h2>
          <ProfileDropdown />
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
