'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/auth/login');
        return;
      }

      setUser(JSON.parse(userStr));

      try {
        const annRes = await fetch(`http://localhost:8001/api/student/announcements/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const assignmentRes = await fetch(`http://localhost:8001/api/student/assignments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (annRes.ok) {
          const annData = await annRes.json();
          setAnnouncements(annData.slice(0, 3));
        }
        if (assignmentRes.ok) {
          const assignmentData = await assignmentRes.json();
          setAssignments(assignmentData.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.first_name} 👋</h1>
      <p className="text-gray-600 mb-8">This is your student dashboard overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">📰 Latest Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-500">No recent announcements.</p>
          ) : (
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="text-gray-700 break-words">
                  <strong>{a.title}</strong> — <em>{a.source}</em>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Assignments */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">📚 Upcoming Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">No upcoming assignments.</p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={a.id} className="text-gray-700 break-words">
                  {a.title} — Due: <strong>{a.due_date}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
