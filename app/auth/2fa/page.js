'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens, startTokenRefresh } from '@/app/utils/auth';
import { jwtDecode } from 'jwt-decode';

export default function TwoFAPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (!storedEmail) {
      router.push('/auth/login');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (res.ok) {
        setTokens(data.access, data.refresh);
        startTokenRefresh();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('email');

        const decoded = jwtDecode(data.access);
        const role = decoded.role;

        if (role) {
          router.push(`/${role.toLowerCase()}/dashboard`);
        } else {
          setError('Login failed: role not found.');
          router.push('/auth/login');
        }
      } else {
        setError(data.error || data.detail || 'Invalid OTP');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Two-Factor Authentication</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter 2FA Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
