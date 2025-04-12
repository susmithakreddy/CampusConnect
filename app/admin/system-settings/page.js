"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import SystemSettingsList from "./components/SystemSettingsList";

export default function SystemSettingsPage() {
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
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <SystemSettingsList />
    </div>
  );
}
