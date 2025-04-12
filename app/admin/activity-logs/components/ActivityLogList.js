"use client";

import { useState, useEffect } from "react";

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/activity-logs/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    const data = await res.json();
    setLogs(data);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Action</th>
            <th>Target Model</th>
            <th>Description</th>
            <th>Admin</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.action_type}</td>
              <td>{log.target_model}</td>
              <td>{log.description}</td>
              <td>{log.admin_email}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
