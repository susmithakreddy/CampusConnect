'use client';

import { useState, useEffect } from 'react';
import AssignmentList from './components/AssignmentList';
import { getAccessToken } from '@/app/utils/auth';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      const token = await getAccessToken();
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8001/api/student/assignments/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch assignments');
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">📚 Assignments</h1>
      <p className="text-gray-600 mb-8">
        Here you can find your upcoming and submitted assignments, grades, and feedback.
      </p>
      <AssignmentList assignments={assignments} />
    </div>
  );
}
