'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import ProgramFormModal from './ProgramModalForm';

export default function ProgramList() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, [router]);

  const fetchPrograms = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/programs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPrograms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch programs error:', err);
    }
  };

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

  const handleCreate = () => {
    setEditProgram(null);
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setEditProgram(program);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/programs/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchPrograms();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.detail || 'Failed to delete program.');
      }
    } catch (err) {
      console.error('Delete program error:', err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchPrograms();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create New Program
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {programs.length === 0 ? (
          <p className="text-center p-6 text-gray-500">No programs found.</p>
        ) : (
          <table className="min-w-full text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{program.id}</td>
                  <td className="p-3">{program.name}</td>
                  <td className="p-3">{program.program_type}</td>
                  <td className="p-3">{departments.find(dep => dep.id === program.department_id)?.name || 'N/A'}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(program)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
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
        <ProgramFormModal
          departments={departments}
          program={editProgram}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
