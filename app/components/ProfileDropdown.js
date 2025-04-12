'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokens, stopTokenRefresh } from '@/app/utils/auth';

export default function ProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    clearTokens();
    stopTokenRefresh();
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <div className="relative inline-block text-left">
      {/* Button (slightly larger but still compact) */}
      <button
        onClick={() => setOpen(!open)}
        className="text-base font-semibold text-gray-700 hover:text-gray-900 focus:outline-none px-2 py-1"
      >
        {user.first_name} <span className="text-sm">▼</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <button
            onClick={() => router.push(`/${user.role.toLowerCase()}/profile`)}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
