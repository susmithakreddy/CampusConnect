'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import CollegeFormModal from './CollegeFormModal';

export default function CollegeList() {
  const [colleges, setColleges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCollege, setEditCollege] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchColleges();
  }, [router]);

  const fetchColleges = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/colleges/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setColleges(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch colleges');
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
    }
  };

  const handleCreate = () => {
    setEditCollege(null);
    setShowModal(true);
  };

  const handleEdit = (college) => {
    setEditCollege(college);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this college?')) return;
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/colleges/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchColleges();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.detail || 'Failed to delete college.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Server error while deleting college.');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchColleges();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Create New College
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {colleges.length === 0 ? (
          <p className="text-center p-6 text-gray-500">No colleges found.</p>
        ) : (
          <table className="min-w-full text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map((college) => (
                <tr key={college.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{college.id}</td>
                  <td className="p-3">{college.name}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(college)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(college.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CollegeFormModal college={editCollege} onClose={handleModalClose} />
      )}
    </div>
  );
}
