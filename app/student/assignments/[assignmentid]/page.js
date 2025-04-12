'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@/app/utils/auth';
import UploadForm from './UploadForm';

export default function AssignmentDetail() {
  const { assignmentid } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUploadSuccess = (newSubmission) => {
    setSubmission(newSubmission);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const assignRes = await fetch(
          `${process.env.NEXT_PUBLIC_STUDENT_API}/assignments/${assignmentid}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!assignRes.ok) throw new Error('Failed to fetch assignment');
        const assignData = await assignRes.json();
        setAssignment(assignData);

        const subRes = await fetch(
          `${process.env.NEXT_PUBLIC_STUDENT_API}/submissions/?assignment=${assignmentid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!subRes.ok) throw new Error('Failed to fetch submission');
        const subData = await subRes.json();
        if (subData.length > 0) {
          setSubmission(subData[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentid, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return <p className="text-gray-500">Assignment not found.</p>;
  }

  const now = new Date();
  const dueDate = assignment?.due_date ? new Date(assignment.due_date) : null;
  const isGraded = submission && submission.grade;
  const canUpload = !isGraded && dueDate && now < dueDate;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-600 mb-2">{assignment.title}</h2>
        <p className="text-gray-700 mb-4">{assignment.description}</p>
        {dueDate && (
          <p className="text-gray-600 text-sm">
            <strong>Due:</strong> {dueDate.toLocaleString()}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {submission ? (
          <>
            <p><strong>Status:</strong> {submission.status}</p>
            {submission.file_url && (
              <p>
                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Uploaded File
                </a>
              </p>
            )}
            {submission.grade && <p><strong>Grade:</strong> {submission.grade}</p>}
            {submission.feedback && <p><strong>Feedback:</strong> {submission.feedback}</p>}

            {canUpload ? (
              <UploadForm assignmentid={assignmentid} onUploadSuccess={handleUploadSuccess} />
            ) : (
              <p className="text-gray-500">{isGraded ? 'Assignment is graded.' : 'Upload window closed.'}</p>
            )}
          </>
        ) : (
          <>
            <p><strong>Status:</strong> No submission yet.</p>
            {canUpload ? (
              <UploadForm assignmentId={assignmentId} onUploadSuccess={handleUploadSuccess} />
            ) : (
              <p className="text-gray-500">Upload window closed or assignment is graded.</p>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="mt-8 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
      >
        ← Back to Assignments
      </button>
    </div>
  );
}
