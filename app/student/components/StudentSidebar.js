'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { clearTokens } from '@/app/utils/auth';

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Courses', href: '/student/courses' },
    { label: 'Assignments', href: '/student/assignments' },
    { label: 'Attendance', href: '/student/attendance' },
    { label: 'Marks', href: '/student/marks' },
  ];

  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div
      className={`flex flex-col h-screen bg-white shadow-md transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <span className="text-lg font-bold text-gray-700">Student</span>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors
              ${
                pathname === item.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {collapsed ? item.label[0] : item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
        >
          {collapsed ? '🚪' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
