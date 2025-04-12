'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import CollegeList from './components/CollegeList';

export default function CollegesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        router.push('/');
        return;
      }
      const userObj = JSON.parse(userStr);
      if (userObj.role !== 'admin') {
        router.push('/');
        return;
      }
      setUser(userObj);
    };
    checkAuth();
  }, [router]);

  if (!user) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Colleges</h1>
      <CollegeList />
    </div>
  );
}
