'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAccessToken } from '@/app/utils/auth';

import OverviewTab from './components/OverviewTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import MaterialsTab from './components/MaterialsTab';
import AssignmentsTab from './components/AssignmentsTab';
import MarksTab from './components/MarksTab';
import AttendanceTab from './components/AttendanceTab';

const tabs = [
  'Overview',
  'Announcements',
  'Materials',
  'Assignments',
  'Marks',
  'Attendance',
];

export default function CourseDetailsPage() {
  const { courseid } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const res = await fetch(`http://localhost:8001/api/student/courses/${courseid}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          console.error('Failed to load course');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseid, router]);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab course={course} />;
      case 'Announcements': return <AnnouncementsTab courseid={courseid} />;
      case 'Materials': return <MaterialsTab courseid={courseid} />;
      case 'Assignments': return <AssignmentsTab courseid={courseid} />;
      case 'Marks': return <MarksTab courseid={courseid} />;
      case 'Attendance': return <AttendanceTab courseid={courseid} />;
      default: return <OverviewTab course={course} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        {course.code} - {course.name}
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition
              ${activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderTab()}
      </div>
    </div>
  );
}
