'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function MarksPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_STUDENT_API}/courses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      }
    };

    fetchCourses();
  }, [router]);

  useEffect(() => {
    if (!selectedCourse) return;
    fetchMarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const url = `${process.env.NEXT_PUBLIC_STUDENT_API}/marks/?course=${selectedCourse}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch marks');
      const data = await res.json();
      setMarksList(data);
    } catch (err) {
      console.error('Error fetching marks:', err);
      setMarksList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📊 Marks</h1>

      {/* Course Selector */}
      <div className="mb-8">
        <label className="block mb-2 text-gray-700 font-medium">Select Course</label>
        <select
          value={selectedCourse}
          onChange={handleCourseChange}
          className="border rounded p-2 w-64"
        >
          <option value="">--Choose a Course--</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading marks...</p>
        </div>
      ) : marksList.length === 0 ? (
        <p className="text-gray-500">No marks found.</p>
      ) : (
        <div className="space-y-6">
          {marksList.map((mark) => (
            <div
              key={mark.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <p className="text-gray-700"><strong>Course:</strong> {mark.course?.name}</p>
              <p className="text-gray-700"><strong>Assignment Score:</strong> {mark.assignment_score ?? 'N/A'}</p>
              <p className="text-gray-700"><strong>Midterm Score:</strong> {mark.midterm_score ?? 'N/A'}</p>
              <p className="text-gray-700"><strong>Final Score:</strong> {mark.final_score ?? 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
