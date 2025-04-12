'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
    setIs2FAEnabled(parsedUser.is_2fa_enabled);
  }, []);

  const handleToggle = async () => {
    const newState = !is2FAEnabled;
    try {
      const res = await fetch('http://localhost:8000/api/admin/2fa-toggle/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_2fa_enabled: newState }),
      });

      const data = await res.json();
      if (res.ok) {
        setIs2FAEnabled(newState);
        setMessage(data.detail);
      } else {
        setMessage(data.detail || 'Something went wrong.');
      }
    } catch (err) {
      setMessage('Update failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Panel: 2FA Settings</h1>
      <p>2FA is currently {is2FAEnabled ? 'Enabled' : 'Disabled'}</p>

      <button onClick={handleToggle}>
        {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
      </button>

      {message && <p>{message}</p>}

      <br />
      <button onClick={() => router.push('/dashboard')}>
        Back to Dashboard
      </button>

      <button
        style={{ marginLeft: '1rem', backgroundColor: '#eee', padding: '0.5rem 1rem' }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
