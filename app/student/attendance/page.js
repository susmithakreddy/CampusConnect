'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function AttendancePage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [month, setMonth] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.present).length;
  const attendancePercent = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

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
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse, month]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      let url = `${process.env.NEXT_PUBLIC_STUDENT_API}/attendance/?course=${selectedCourse}`;
      if (month) {
        url += `&month=${month}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setAttendanceRecords(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => setSelectedCourse(e.target.value);
  const handleMonthChange = (e) => setMonth(e.target.value);

  const formatDate = (isoStr) => new Date(isoStr).toLocaleDateString();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📅 Attendance</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Select Course</label>
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

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Month (1-12)</label>
          <input
            type="number"
            value={month}
            onChange={handleMonthChange}
            min="1"
            max="12"
            className="border rounded p-2 w-24"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading attendance...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="mb-6">
            <p className="text-gray-700">
              <strong>Total Classes:</strong> {totalClasses} |{' '}
              <strong>Present:</strong> {presentCount} |{' '}
              <strong>Attendance:</strong> {attendancePercent.toFixed(1)}%
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded h-4 mt-2">
              <div
                className={`h-4 rounded ${attendancePercent >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${attendancePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Attendance Records */}
          {attendanceRecords.length === 0 ? (
            <p className="text-gray-500">No attendance records found.</p>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition"
                >
                  <p><strong>Date:</strong> {formatDate(rec.date)}</p>
                  <p><strong>Status:</strong> {rec.present ? 'Present' : 'Absent'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
