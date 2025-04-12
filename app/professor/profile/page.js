'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfessorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [passwordOld, setPasswordOld] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const user = JSON.parse(localStorage.getItem('user'));
      setProfile(user);
    };
    fetchProfile();
  }, [router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password1 !== password2) {
      setMessage('New passwords do not match.');
      return;
    }

    const token = localStorage.getItem('access');
    const res = await fetch('http://localhost:8000/api/auth/change-password/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: passwordOld,
        new_password: password1,
      }),
    });

    if (res.ok) {
      setMessage('Password changed successfully!');
      setPasswordOld('');
      setPassword1('');
      setPassword2('');
    } else {
      const data = await res.json();
      setMessage(data.detail || 'Password change failed.');
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="flex flex-col max-h-[calc(100vh-12rem)] overflow-y-auto p-8 space-y-8 bg-white rounded-lg shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>

      <hr />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            value={passwordOld}
            onChange={(e) => setPasswordOld(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="New Password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
          >
            Change Password
          </button>
        </form>

        {message && (
          <p className={`mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
