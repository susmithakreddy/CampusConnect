'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import Link from 'next/link';

export default function AssignmentsTab() {
  const { courseid } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const token = await getAccessToken();
        const res = await fetch(`http://localhost:8001/api/student/courses/${courseid}/assignments/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch assignments');
        }

        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [courseid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return <p className="text-gray-500">No assignments found.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">📝 Course Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{assignment.title}</h3>
            <p className="text-gray-700 mb-2">{assignment.description}</p>
            {assignment.status && (
              <p className="text-sm font-medium mb-2">
                Status:{' '}
                <span className={
                  assignment.status === 'Due' ? 'text-orange-500' :
                  assignment.status === 'Submitted' ? 'text-blue-500' :
                  assignment.status === 'Graded' ? 'text-green-500' :
                  assignment.status === 'Late' ? 'text-red-500' : 'text-gray-400'
                }>
                  {assignment.status}
                </span>
              </p>
            )}
            <Link
              href={`/student/assignments/${assignment.id}`}
              className="text-blue-500 hover:underline text-sm font-semibold"
            >
              View full details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
