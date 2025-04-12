'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AnnouncementsTab() {
  const { courseid } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [courseid]);

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/announcements/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`http://localhost:8002/api/professor/courses/${courseid}/announcements/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message }),
    });
    if (res.ok) {
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } else {
      alert('Failed to create announcement.');
    }
  };

  if (loading) return <p className="text-gray-500">Loading announcements...</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)] overflow-y-auto space-y-6">
      {/* Create Announcement Form */}
      <div className="bg-gray-50 p-4 rounded-md shadow-sm space-y-4">
        <h2 className="text-xl font-bold mb-2">Post Announcement</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full p-2 border rounded text-sm"
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          Create
        </button>
      </div>

      {/* Existing Announcements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">📢 Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="p-4 border rounded shadow-sm">
              <h4 className="font-semibold">{a.title}</h4>
              <p className="text-gray-700">{a.message}</p>
              <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
