'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [router]);

  const fetchAssignments = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:8002/api/professor/assignments/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const res = await fetch(`http://localhost:8002/api/professor/assignments/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAssignments(assignments.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) return <p className="text-gray-500">Loading assignments...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/professor/assignments/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          + Create New Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments found.</p>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="p-4 border rounded shadow-sm space-y-2">
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-gray-500 text-sm">Due: {new Date(assignment.due_date).toLocaleString()}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/professor/assignments/${assignment.id}`)}
                  className="text-blue-600 text-sm underline"
                >
                  View / Edit
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
