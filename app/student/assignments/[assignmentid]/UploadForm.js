'use client';

import { useState } from 'react';
import { getAccessToken } from '@/app/utils/auth';

export default function UploadForm({ assignmentid, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      alert('You must be logged in.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('assignment', assignmentid);
      formData.append('file', selectedFile);

      const res = await fetch(`http://localhost:8001/api/student/submissions/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.detail || `Upload failed with status ${res.status}`;
        alert(msg);
        return;
      }

      const submission = await res.json();
      if (onUploadSuccess) {
        onUploadSuccess(submission);
      }
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('An error occurred while uploading.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4 mt-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="border rounded p-2"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        Upload
      </button>
    </form>
  );
}
