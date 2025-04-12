'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function OverviewTab() {
  const { courseid } = useParams();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      const token = localStorage.getItem('access');
      const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/overview/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    };

    fetchOverview();
  }, [courseid]);

  if (!overview) return <p className="text-gray-500">Loading overview...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <div className="bg-gray-50 p-4 rounded-md shadow-sm">
        <h2 className="text-xl font-bold mb-2">{overview.course.name}</h2>
        <p className="text-gray-700"><strong>Description:</strong> {overview.course.description}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold mb-2">🎓 Enrolled Students</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {overview.students.map((student) => (
            <li key={student.student_id}>{student.student_email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
