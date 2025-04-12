'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/app/utils/auth';
import { useRouter } from 'next/navigation';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      try {
        const res = await fetch(`http://localhost:8003/api/admin/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  const handleEdit = (user) => {
    // You can show modal here if you want later
    console.log('Edit user:', user);
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
        );
        alert('User deactivated successfully');
      } else {
        alert('Failed to deactivate user');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const handleActivate = async (userId) => {
    if (!confirm('Are you sure you want to activate this user?')) return;
    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: true }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u))
        );
        alert('User activated successfully');
      } else {
        alert('Failed to activate user');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-500">
        Loading Users...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <button
          onClick={() => router.push('/admin/users/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create New User
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">2FA</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.first_name} {u.last_name}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.is_2fa_enabled ? "Enabled" : "Disabled"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                  >
                    Edit
                  </button>
                  {u.is_active ? (
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(u.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
