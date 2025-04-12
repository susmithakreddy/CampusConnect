'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
      <h1 className="text-5xl font-bold mb-6 text-center">Welcome to CampusConnect</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Your portal to manage courses, assignments, attendance, and more at The Heritage University.
      </p>
      <button
        onClick={handleGetStarted}
        className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
      >
        Get Started
      </button>
    </div>
  );
}
