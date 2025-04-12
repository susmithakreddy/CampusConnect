'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import OverviewTab from './components/OverviewTab';
import AnnouncementsTab from './components/AnnouncementsTab';
import MaterialsTab from './components/MaterialsTab';
import AssignmentsTab from './components/AssignmentsTab';

export default function CourseDetailPage() {
  const { courseid } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab courseid={courseid} />;
      case 'announcements':
        return <AnnouncementsTab courseid={courseid} />;
      case 'materials':
        return <MaterialsTab courseid={courseid} />;
      case 'assignments':
        return <AssignmentsTab courseid={courseid} />;
      default:
        return <OverviewTab courseid={courseid} />;
    }
  };

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Announcements', value: 'announcements' },
    { label: 'Materials', value: 'materials' },
    { label: 'Assignments', value: 'assignments' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] p-6 overflow-hidden">
      {/* Page Title */}
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-2">📖</span>
        <h1 className="text-2xl font-bold">Course Details</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-6 rounded-md shadow-md">
        {renderTab()}
      </div>
    </div>
  );
}
