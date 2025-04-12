'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfessorDashboard() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (url) => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/auth/login');
      return null;
    }

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (err) {
      console.error('API Fetch Error:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const [annData, assignData] = await Promise.all([
        fetchData('http://localhost:8002/api/professor/announcements/'),
        fetchData('http://localhost:8002/api/professor/assignments/'),
      ]);
      if (annData) setAnnouncements(annData.slice(0, 3));
      if (assignData) setAssignments(assignData.slice(0, 3));
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">👨‍🏫 Welcome, Professor!</h1>
      <p className="text-gray-600 mb-10">Here’s a quick overview of your latest announcements and assignments.</p>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Announcements */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📢 Admin Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-500">No recent announcements.</p>
          ) : (
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="text-gray-700">
                  <strong>{a.title}</strong> — {new Date(a.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📚 Upcoming Assignments</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500">No upcoming assignments.</p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li key={a.id} className="text-gray-700">
                  {a.title} — Due: <strong>{new Date(a.due_date).toLocaleDateString()}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
