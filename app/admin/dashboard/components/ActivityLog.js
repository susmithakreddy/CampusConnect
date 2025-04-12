'use client';

export default function ActivityLog({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-gray-500">
        No recent activities found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="font-semibold text-gray-700">
            {activity.action_type.toUpperCase()} - {activity.target_model}
          </div>
          <div className="text-gray-600">{activity.description}</div>
          <div className="text-gray-400 text-sm mt-1">{new Date(activity.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
