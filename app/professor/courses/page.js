'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const res = await fetch('http://localhost:8002/api/professor/courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    };

    fetchCourses();
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📚 My Courses</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/professor/courses/${course.id}`)}
              className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold mb-2">{course.code} — {course.name}</h2>
              <p className="text-gray-600">{course.description || 'No description available.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
