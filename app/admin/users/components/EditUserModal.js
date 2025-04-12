'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";

export default function EditUserModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    is_2fa_enabled: user.is_2fa_enabled || false,
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/users/${user.id}/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("User updated successfully.");
        onClose();
      } else {
        const error = await res.json();
        alert(error.detail || "Failed to update user.");
      }
    } catch (err) {
      console.error('Update user error:', err);
      alert('Server error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 space-y-6">
        <h2 className="text-xl font-bold">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>
          <div>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_2fa_enabled"
              checked={formData.is_2fa_enabled}
              onChange={handleChange}
            />
            <span>Enable 2FA</span>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Save
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
