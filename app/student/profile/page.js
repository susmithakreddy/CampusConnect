'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [passwordOld, setPasswordOld] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        setUserName(`${userObj.first_name} ${userObj.last_name}`);
      }

      try {
        const res = await fetch('http://localhost:8001/api/student/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setProfile(data[0]);
          }
        } else {
          setError('Failed to load profile.');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('An error occurred.');
      }
    };

    fetchProfile();
  }, [router]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordOld || !password1 || !password2) {
      setPasswordMessage('Please fill in all password fields.');
      return;
    }

    if (password1.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.');
      return;
    }

    if (password1 !== password2) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsChanging(true);

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
        setPasswordOld('');
        setPassword1('');
        setPassword2('');
        alert('Password changed successfully.');
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Change password error:', err);
      alert('An error occurred while changing password.');
    } finally {
      setIsChanging(false);
    }
  };

  if (error) {
    return <p className="text-red-500 p-8">{error}</p>;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🙋‍♂️ My Profile</h1>

      {/* Profile Details */}
      <div className="space-y-2 mb-10">
        <p><strong>Name:</strong> {userName}</p>
        <p><strong>Email:</strong> {profile.user_email}</p>
        <p><strong>College:</strong> {profile.college?.name}</p>
        <p><strong>Department:</strong> {profile.department?.name}</p>
        <p><strong>Program:</strong> {profile.program?.name} ({profile.program?.program_type})</p>
        <p><strong>Enrollment Year:</strong> {profile.enrollment_year}</p>
      </div>

      <hr className="my-8" />

      {/* Change Password Section */}
      <h2 className="text-2xl font-semibold mb-6">🔒 Change Password</h2>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Old Password</label>
          <input
            type="password"
            value={passwordOld}
            onChange={(e) => setPasswordOld(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>

        {passwordMessage && (
          <p className="text-red-500">{passwordMessage}</p>
        )}

        <button
          type="submit"
          disabled={isChanging}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded disabled:opacity-50"
        >
          {isChanging ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
