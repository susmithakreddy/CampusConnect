'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/colleges", label: "Manage Colleges" },
    { href: "/admin/departments", label: "Manage Departments" },
    { href: "/admin/programs", label: "Manage Programs" },
    { href: "/admin/courses", label: "Manage Courses" },
    { href: "/admin/announcements", label: "Announcements" },
    { href: "/admin/system-settings", label: "System Settings" },
    { href: "/admin/activity-logs", label: "Activity Logs" },
    { href: "/admin/profile", label: "Profile" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-6 space-y-4 fixed top-0 left-0">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-md hover:bg-gray-700 ${
            pathname.startsWith(link.href)
              ? 'bg-gray-700 font-semibold'
              : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
