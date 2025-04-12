'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function DepartmentFormModal({ colleges, department, onClose }) {
  const [name, setName] = useState(department ? department.name : '');
  const [collegeId, setCollegeId] = useState(department ? department.college_id : '');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const method = department ? 'PATCH' : 'POST';
    const url = department
      ? `http://localhost:8003/api/admin/departments/${department.id}/`
      : `http://localhost:8003/api/admin/departments/`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name,
          college_id: parseInt(collegeId, 10),
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to save department');
      }
      onClose();
    } catch (err) {
      console.error('Error saving department:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 space-y-6">
        <h2 className="text-xl font-bold">{department ? 'Edit Department' : 'Create Department'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">College</label>
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              required
              className="input w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select College</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              {department ? 'Save Changes' : 'Create'}
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
