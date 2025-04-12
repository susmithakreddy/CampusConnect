"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/app/utils/auth";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
    } else {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword1 !== newPassword2) {
      setMessage("New passwords do not match.");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      router.push('/');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword1,
        }),
      });

      if (res.ok) {
        setMessage("Password changed successfully!");
        setOldPassword('');
        setNewPassword1('');
        setNewPassword2('');
      } else {
        const data = await res.json();
        setMessage(data.detail || "Failed to change password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label>Old Password</label>
            <input
              type="password"
              className="input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4" style={{ color: message.includes("successfully") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
