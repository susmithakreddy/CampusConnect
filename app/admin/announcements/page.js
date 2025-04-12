'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_type: 'all_users',
    target_id: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:8003/api/admin/announcements/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getAccessToken();

    const payload = { ...formData };
    if (payload.target_id === '') {
      payload.target_id = null;
    }

    const url = editId
      ? `http://localhost:8003/api/admin/announcements/${editId}/`
      : 'http://localhost:8003/api/admin/announcements/';
    const method = editId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Announcement saved.');
        setShowForm(false);
        setFormData({ title: '', message: '', target_type: 'all_users', target_id: '' });
        setEditId(null);
        fetchAnnouncements();
      } else {
        alert('Failed to save announcement.');
      }
    } catch (err) {
      console.error('Error saving announcement', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const token = await getAccessToken();
    try {
      await fetch(`http://localhost:8003/api/admin/announcements/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      target_type: announcement.target_type,
      target_id: announcement.target_id || '',
    });
    setEditId(announcement.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)] text-gray-500">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Announcements</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setFormData({ title: '', message: '', target_type: 'all_users', target_id: '' });
          }}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Create Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block mb-1 font-semibold">Title</label>
            <input
              className="input input-bordered w-full"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Message</label>
            <textarea
              className="input input-bordered w-full"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Target Type</label>
            <select
              className="input input-bordered w-full"
              name="target_type"
              value={formData.target_type}
              onChange={handleChange}
              required
            >
              <option value="all_users">All Users</option>
              <option value="students">Students Only</option>
              <option value="professors">Professors Only</option>
              <option value="college">Specific College</option>
              <option value="department">Specific Department</option>
              <option value="program">Specific Program</option>
            </select>
          </div>
          {(formData.target_type === 'college' ||
            formData.target_type === 'department' ||
            formData.target_type === 'program') && (
            <div>
              <label className="block mb-1 font-semibold">Target ID</label>
              <input
                className="input input-bordered w-full"
                name="target_id"
                value={formData.target_id}
                onChange={handleChange}
                type="number"
                required
              />
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <button type="submit" className="btn btn-success">
              {editId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Target</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{a.title}</td>
                <td className="p-3">{a.message}</td>
                <td className="p-3">{a.target_type}{a.target_id ? ` (${a.target_id})` : ''}</td>
                <td className="p-3">{a.created_by}</td>
                <td className="p-3 space-x-2">
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(a)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(a.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
