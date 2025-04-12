'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AssignmentsTab() {
  const router = useRouter();
  const { courseid } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [courseid]);

  const fetchAssignments = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/assignments/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAssignments(data);
    }
    setLoading(false);
  };

  const handleCreateAssignment = () => {
    router.push(`/professor/assignments/create?course=${courseid}`);
  };

  const handleViewAssignment = (assignmentId) => {
    router.push(`/professor/assignments/${assignmentId}`);
  };

  if (loading) return <p className="text-gray-500">Loading assignments...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      {/* Create Assignment Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateAssignment}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          + Create Assignment
        </button>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => handleViewAssignment(assignment.id)}
              className="p-4 border rounded shadow-sm hover:bg-gray-100 cursor-pointer"
            >
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-sm text-gray-500">
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
