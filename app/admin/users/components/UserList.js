'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }
      try {
        const res = await fetch(`http://localhost:8003/api/admin/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading users...
      </div>
    );
  }

  const handleEdit = (userId) => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleDeactivate = async (userId) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/users/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("User deactivated successfully");
        setUsers(prev => prev.filter((u) => u.id !== userId));
      } else {
        alert("Failed to deactivate user");
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Error occurred while deactivating.');
    }
  };

  const handleCreateUser = () => {
    router.push("/admin/users/create");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <button
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          + Create New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">2FA</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.first_name} {u.last_name}</td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">{u.is_2fa_enabled ? "Enabled" : "Disabled"}</td>
                <td className="px-6 py-4">{u.is_active ? "Active" : "Deactivated"}</td>
                <td className="px-6 py-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(u.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Deactivate
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
