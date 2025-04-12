'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function AnnouncementsTab() {
  const { courseid } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = await getAccessToken();
      if (!token) return;

      try {
        const res = await fetch(
          `http://localhost:8001/api/student/courses/${courseid}/announcements/`, // 🔥 Correct endpoint now
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        } else {
          console.error('Failed to fetch announcements:', res.status);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading announcements...</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <p className="text-gray-500">No announcements for this course.</p>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((a) => (
        <div
          key={a.id}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-semibold text-blue-600 mb-2">{a.title}</h3>
          <p className="text-gray-700 mb-2">{a.message}</p>
          <p className="text-sm text-gray-500">
            Posted on: {new Date(a.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
