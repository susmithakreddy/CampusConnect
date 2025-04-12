'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import DepartmentFormModal from './DepartmentFormModal';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchDepartments();
    fetchColleges();
  }, [router]);

  const fetchDepartments = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/departments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    }
  };

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
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    }
  };

  const handleCreate = () => {
    setEditDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditDepartment(dept);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/departments/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchDepartments();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.detail || 'Failed to delete department.');
      }
    } catch (err) {
      console.error('Delete department error:', err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchDepartments();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Create New Department
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {departments.length === 0 ? (
          <p className="text-center p-6 text-gray-500">No departments found.</p>
        ) : (
          <table className="min-w-full text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">College</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{dept.id}</td>
                  <td className="p-3">{dept.name}</td>
                  <td className="p-3">{colleges.find(c => c.id === dept.college_id)?.name || 'N/A'}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
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
        <DepartmentFormModal
          colleges={colleges}
          department={editDepartment}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
