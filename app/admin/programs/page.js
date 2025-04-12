'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import ProgramList from './components/ProgramList';

export default function ProgramsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) router.push('/');
      else setUser(JSON.parse(userStr));
    };
    checkAuth();
  }, [router]);

  if (!user) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Programs</h1>
      <ProgramList />
    </div>
  );
}
