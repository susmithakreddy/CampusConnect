'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function CollegeFormModal({ college, onClose }) {
  const [name, setName] = useState(college ? college.name : '');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const method = college ? 'PATCH' : 'POST';
    const url = college
      ? `http://localhost:8003/api/admin/colleges/${college.id}/`
      : `http://localhost:8003/api/admin/colleges/`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error('Failed to submit college form');
      }
      onClose();
    } catch (err) {
      console.error('College form submit error:', err);
      alert('Server error while saving college.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 space-y-6">
        <h2 className="text-xl font-bold">{college ? 'Edit College' : 'Create College'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">College Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              {college ? 'Save Changes' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
