'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import UserBasicInfoForm from "./components/UserBasicInfoForm";
import UserProfileForm from "./components/UserProfileForm";

export default function CreateUserPage() {
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({});
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        router.push('/');
      } else {
        setUser(JSON.parse(userStr));
      }
    };
    checkAuth();
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-gray-500">
        Loading Create User...
      </div>
    );
  }

  const handleBasicInfoSubmit = (data) => {
    setBasicInfo(data);
    setStep(2);
  };

  const handleProfileInfoSubmit = async (data) => {
    const finalData = { ...basicInfo, ...data };
    try {
      const res = await fetch(`http://localhost:8003/api/admin/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(finalData),
      });
      if (res.ok) {
        alert("User created successfully!");
        router.push("/admin/users");
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Create New User</h1>
      {step === 1 && <UserBasicInfoForm onNext={handleBasicInfoSubmit} />}
      {step === 2 && <UserProfileForm role={basicInfo.role} onSubmit={handleProfileInfoSubmit} />}
    </div>
  );
}
