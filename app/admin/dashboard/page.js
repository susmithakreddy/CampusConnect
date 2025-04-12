'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import MetricCard from "./components/MetricCard";
import ActivityLog from "./components/ActivityLog";

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/');
      } else {
        setUser(JSON.parse(userStr));
        fetchDashboardData(token);
      }
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async (token) => {
    try {
      const res = await fetch(`http://localhost:8003/api/admin/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-500">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">{dashboardData.site_name} Admin Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard label="Students" value={dashboardData.students_count} />
        <MetricCard label="Professors" value={dashboardData.professors_count} />
        <MetricCard label="Admins" value={dashboardData.admins_count} />
        <MetricCard label="Courses" value={dashboardData.courses_count} />
        <MetricCard label="Colleges" value={dashboardData.colleges_count} />
        <MetricCard label="Departments" value={dashboardData.departments_count} />
        <MetricCard label="Programs" value={dashboardData.programs_count} />
        <MetricCard label="Active Users" value={dashboardData.active_users_count} />
        <MetricCard label="2FA Enabled" value={dashboardData["2fa_enabled"] ? "Yes" : "No"} />
      </div>

      {/* Activity Logs */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Admin Activities</h2>
        <ActivityLog activities={dashboardData.recent_activities} />
      </div>
    </div>
  );
}
