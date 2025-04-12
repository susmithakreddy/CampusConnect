'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function MaterialsTab() {
  const { courseid } = useParams();
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [courseid]);

  const fetchMaterials = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/materials/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMaterials(data);
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Select a file first.');
      return;
    }
    const token = localStorage.getItem('access');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);

    const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/materials/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setTitle('');
      setDescription('');
      setFile(null);
      fetchMaterials();
    } else {
      alert('Failed to upload material.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading materials...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      {/* Upload Material Form */}
      <div className="space-y-4 bg-gray-50 p-4 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Upload Material</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full p-2 border rounded text-sm"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-2 text-sm"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          Upload
        </button>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uploaded Materials</h3>
        {materials.length === 0 ? (
          <p className="text-gray-500">No materials yet.</p>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="p-4 border rounded shadow-sm">
              <h4 className="font-semibold">{material.title}</h4>
              <p className="text-gray-600 text-sm">{material.description}</p>
              {material.file_url && (
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm underline"
                >
                  Download
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
