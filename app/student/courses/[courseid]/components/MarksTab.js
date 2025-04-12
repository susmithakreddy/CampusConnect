'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function MarksTab() {
  const { courseid } = useParams();
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `http://localhost:8001/api/student/courses/${courseid}/marks/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch marks');
        }

        const data = await res.json();
        setMarks(data);
      } catch (err) {
        console.error('Error fetching marks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [courseid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading marks...</p>
      </div>
    );
  }

  if (!marks) {
    return <p className="text-gray-500">No marks available for this course.</p>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">📊 Course Marks</h2>
      <p><strong>Assignment Marks:</strong> {marks.assignment_score ?? 'N/A'}</p>
      <p><strong>Midterm Marks:</strong> {marks.midterm_score ?? 'N/A'}</p>
      <p><strong>Final Marks:</strong> {marks.final_score ?? 'N/A'}</p>
    </div>
  );
}
