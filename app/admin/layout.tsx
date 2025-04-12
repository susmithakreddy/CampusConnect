'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './components/AdminSidebar'; // ✅ same as student/professor
import { getAccessToken } from '@/app/utils/auth';
import ProfileDropdown from '@/app/components/ProfileDropdown'; // ✅ same as student/professor

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/');
      } else {
        const userObj = JSON.parse(userStr);
        if (userObj.role !== 'admin') {
          router.push('/');
        } else {
          setUser(userObj);
        }
      }
    };

    checkAuth();
  }, [router]);

  if (!user) return (
    <div className="flex items-center justify-center h-screen text-gray-600">
      Loading...
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />

      <div className="flex flex-col flex-1 min-h-screen max-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center h-16 px-8 bg-white shadow-sm border-b">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <ProfileDropdown />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
