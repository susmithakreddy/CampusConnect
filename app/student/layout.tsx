'use client';

import { ReactNode } from 'react';
import ProfileDropdown from '@/app/components/ProfileDropdown';
import StudentSidebar from './components/StudentSidebar';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar (fixed left) */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <StudentSidebar />
      </div>

      {/* Right side (Header + Main Content) */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-700">Student Dashboard</h2>
          <ProfileDropdown />
        </header>

        {/* Scrollable Main Content (NO padding now) */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
