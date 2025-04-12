'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function ProfessorSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/professor/dashboard' },
    { label: 'Courses', href: '/professor/courses' },
    { label: 'Assignments', href: '/professor/assignments' },
    { label: 'Attendance', href: '/professor/attendance' },
    { label: 'Marks', href: '/professor/marks' },
  ];

  return (
    <div className="w-[200px] h-screen bg-gray-100 fixed top-0 left-0 flex flex-col p-6">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-700 mb-8">Professor</h2>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2 font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-md ${
              pathname.startsWith(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
