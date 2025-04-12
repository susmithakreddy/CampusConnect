'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseid = searchParams.get('course');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/assignments/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate }),
      });

      if (res.ok) {
        setSuccess('Assignment created successfully!');
        setTimeout(() => {
          router.push(`/professor/courses/${courseid}`);
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create assignment.');
      }
    } catch (err) {
      console.error('Create assignment error:', err);
      setError('Server error.');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <div className="bg-gray-50 p-6 rounded-md shadow-sm space-y-4">
        <h1 className="text-2xl font-bold mb-2">Create New Assignment</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded text-sm"
          >
            Create Assignment
          </button>
        </form>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </div>
    </div>
  );
}
