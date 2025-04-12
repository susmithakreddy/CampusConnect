'use client';

export default function MetricCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="mt-2 text-gray-500">{label}</div>
    </div>
  );
}
