"use client";

import { useState, useEffect } from "react";

export default function SystemSettingsList() {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/system-settings/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    const data = await res.json();
    setSettings(data);
  };

  const handleUpdate = async (id, value) => {
    await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/system-settings/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ value }),
    });
    fetchSettings();
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {settings.map((setting) => (
            <tr key={setting.id}>
              <td>{setting.key}</td>
              <td>
                <input
                  className="input"
                  defaultValue={setting.value}
                  onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                />
              </td>
              <td>
                <span className="text-gray-500 text-xs">Auto-save on blur</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
