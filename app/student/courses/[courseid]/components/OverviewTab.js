'use client';

export default function OverviewTab({ course }) {
  if (!course) {
    return (
      <p className="text-gray-500">Course information is unavailable.</p>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-blue-600">
        {course.name} ({course.code})
      </h2>

      <div className="space-y-2">
        <p>
          <strong className="text-gray-700">Professor:</strong> {course.professor_name || 'N/A'}
        </p>
        <p>
          <strong className="text-gray-700">Description:</strong> {course.description || 'No description available.'}
        </p>
        <p>
          <strong className="text-gray-700">Term:</strong> {course.term || 'Not specified'}
        </p>
      </div>
    </div>
  );
}
