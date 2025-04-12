'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const { assignmentid } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentid]);

  const fetchAssignment = async () => {
    const token = localStorage.getItem('access');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8002/api/professor/assignments/${assignmentid}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignment(data.assignment);
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...submissions];
    updated[index][field] = value;
    setSubmissions(updated);
  };

  const handleSubmissionUpdate = async (submissionId, grade, feedback) => {
    const token = localStorage.getItem('access');
    await fetch(`http://localhost:8002/api/professor/submissions/${submissionId}/grade/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade, feedback }),
    });
  };

  if (loading) return <p className="text-gray-500">Loading assignment...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      <div className="bg-gray-50 p-6 rounded-md shadow-sm">
        <h1 className="text-2xl font-bold mb-4">{assignment?.title}</h1>
        <p className="text-gray-700 mb-4">{assignment?.description}</p>
        <p className="text-sm text-gray-500">Due: {new Date(assignment?.due_date).toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-gray-500">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">File</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Grade</th>
                  <th className="p-2 text-left">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, idx) => (
                  <tr key={sub.submission_id} className="border-t">
                    <td className="p-2">{sub.student_email}</td>
                    <td className="p-2">
                      {sub.submission_file_url ? (
                        <a href={sub.submission_file_url} target="_blank" className="text-blue-600 underline">
                          View
                        </a>
                      ) : (
                        'No File'
                      )}
                    </td>
                    <td className="p-2">{sub.status}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={sub.grade || ''}
                        onChange={(e) => handleFieldChange(idx, 'grade', e.target.value)}
                        onBlur={() => handleSubmissionUpdate(sub.submission_id, sub.grade, sub.feedback)}
                        className="border rounded p-1 w-20"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={sub.feedback || ''}
                        onChange={(e) => handleFieldChange(idx, 'feedback', e.target.value)}
                        onBlur={() => handleSubmissionUpdate(sub.submission_id, sub.grade, sub.feedback)}
                        className="border rounded p-1 w-40"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
