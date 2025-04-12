'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

export default function MaterialsTab() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { courseid } = useParams();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }
        const response = await fetch(
          `http://localhost:8001/api/student/courses/${courseid}/materials/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMaterials(data);
        } else {
          console.error('Failed to fetch materials:', response.status);
          setMaterials([]);
        }
      } catch (err) {
        console.error('Error fetching materials:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseid) {
      fetchMaterials();
    }
  }, [courseid, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading materials...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <p className="text-gray-500">No materials available for this course.</p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">📚 Course Materials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((material) => (
          <div key={material.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <a
              href={material.file_url}
              download
              className="block text-lg font-semibold text-blue-600 hover:underline mb-2"
            >
              {material.title}
            </a>
            <p className="text-gray-700">{material.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
