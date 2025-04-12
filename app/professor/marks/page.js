'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarksPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marksData, setMarksData] = useState([]);

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

  const fetchMarks = async () => {
    if (!selectedCourse) return;
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/marks/?course_id=${selectedCourse}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMarksData(
        data.map((student) => ({
          id: student.id,
          student_email: student.student_email,
          assignment_score: student.assignment_score,
          midterm_score: student.midterm_score,
          final_score: student.final_score,
        }))
      );
    }
  };

  const handleMarkChange = (index, field, value) => {
    const updated = [...marksData];
    updated[index][field] = parseFloat(value);
    setMarksData(updated);
  };

  const handleSave = async (id, index) => {
    const token = localStorage.getItem('access');
    const student = marksData[index];
    const res = await fetch(`http://localhost:8002/api/professor/marks/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        course_id: selectedCourse,
        student_id: student.id,
        assignment_score: student.assignment_score,
        midterm_score: student.midterm_score,
        final_score: student.final_score,
      }),
    });
    if (res.ok) {
      alert('Marks updated!');
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('Error updating marks:', errorData);
      alert(errorData.detail || 'Failed to update marks.');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <h1 className="text-2xl font-bold">Marks</h1>

      <div className="flex flex-wrap gap-4 items-center">
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

        <button
          onClick={fetchMarks}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          Load Students
        </button>
      </div>

      {marksData.length > 0 && (
        <div className="overflow-x-auto mt-6 bg-gray-50 p-4 rounded shadow-sm max-h-[50vh] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Student Email</th>
                <th className="p-2 text-center">Assignment</th>
                <th className="p-2 text-center">Midterm</th>
                <th className="p-2 text-center">Final</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {marksData.map((student, index) => (
                <tr key={student.id} className="border-t">
                  <td className="p-2">{student.student_email}</td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={student.assignment_score}
                      onChange={(e) => handleMarkChange(index, 'assignment_score', e.target.value)}
                      className="border p-1 w-20 rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={student.midterm_score}
                      onChange={(e) => handleMarkChange(index, 'midterm_score', e.target.value)}
                      className="border p-1 w-20 rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={student.final_score}
                      onChange={(e) => handleMarkChange(index, 'final_score', e.target.value)}
                      className="border p-1 w-20 rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleSave(student.id, index)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
