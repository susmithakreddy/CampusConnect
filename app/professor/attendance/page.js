'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch('http://localhost:8002/api/professor/courses/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCourses(data);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse || !date) return;
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/courses/${selectedCourse}/overview/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const formatted = data.students.map((student) => ({
        student_id: student.student_id,
        student_email: student.student_email,
        present: true,
      }));
      setStudents(formatted);
      setAttendanceData(formatted);
    }
  };

  const handleAttendanceChange = (index, present) => {
    const updated = [...attendanceData];
    updated[index].present = present;
    setAttendanceData(updated);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch('http://localhost:8002/api/professor/attendance/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_id: selectedCourse,
        date,
        attendances: attendanceData,
      }),
    });
    if (res.ok) {
      alert('Attendance Saved!');
    } else {
      alert('Failed to save attendance.');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Attendance</h1>

        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded text-sm"
          />

          <button
            onClick={fetchStudents}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
          >
            Load Students
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="overflow-x-auto mt-6 bg-gray-50 p-4 rounded shadow-sm max-h-[50vh] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Student Email</th>
                <th className="p-2 text-center">Present</th>
                <th className="p-2 text-center">Absent</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((student, index) => (
                <tr key={student.student_id} className="border-t">
                  <td className="p-2">{student.student_email}</td>
                  <td className="p-2 text-center">
                    <input
                      type="radio"
                      checked={student.present === true}
                      onChange={() => handleAttendanceChange(index, true)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="radio"
                      checked={student.present === false}
                      onChange={() => handleAttendanceChange(index, false)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded text-sm"
            >
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
