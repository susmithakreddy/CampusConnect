'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';
import { API_BASES } from '@/app/utils/api';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await fetch(`http://localhost:8001/api/student/courses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Your Courses</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500">You are not enrolled in any courses.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/student/courses/${course.id}`)}
              className="cursor-pointer bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-gray-200 hover:border-blue-400"
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-2">
                {course.code}
              </h2>
              <p className="text-gray-700">{course.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
