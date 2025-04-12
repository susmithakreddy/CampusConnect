"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchLogs();
  }, [router]);

  const fetchLogs = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8003/api/admin/activity-logs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to fetch activity logs.");
        return;
      }

      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unexpected error fetching activity logs:", error);
      alert("Something went wrong while fetching activity logs.");
    }
  };

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
          <tr>
            <th className="p-3 text-left">Action</th>
            <th className="p-3 text-left">Target Model</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Admin</th>
            <th className="p-3 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b hover:bg-gray-50 align-top">
              <td className="p-3 whitespace-normal break-words">{log.action_type}</td>
              <td className="p-3 whitespace-normal break-words">{log.target_model}</td>
              <td className="p-3 whitespace-normal break-words">{log.description}</td>
              <td className="p-3 whitespace-normal break-words">{log.admin_email}</td>
              <td className="p-3 whitespace-normal break-words">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
