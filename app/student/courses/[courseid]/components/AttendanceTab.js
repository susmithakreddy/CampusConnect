'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function AttendanceTab() {
  const { courseid } = useParams();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `http://localhost:8001/api/student/courses/${courseid}/attendance/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch attendance records');
        }

        const data = await res.json();
        setAttendanceRecords(data);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [courseid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading attendance records...</p>
      </div>
    );
  }

  if (attendanceRecords.length === 0) {
    return <p className="text-gray-500">No attendance records found.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">📅 Attendance Records</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendanceRecords.map((record) => (
          <div
            key={record.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {record.present ? 'Present' : 'Absent'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
