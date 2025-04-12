'use client';

import Link from 'next/link';

export default function AssignmentList({ assignments = [] }) {
  if (!assignments.length) {
    return <p className="text-gray-500">No assignments found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-blue-600 mb-2">
            <Link href={`/student/assignments/${assignment.id}`}>
              {assignment.title || assignment.name}
            </Link>
          </h3>

          {assignment.due_date && (
            <p className="text-gray-700 text-sm">
              <strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
