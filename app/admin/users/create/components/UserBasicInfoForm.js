'use client';

import { useState } from "react";

export default function UserBasicInfoForm({ onNext }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>First Name</label>
        <input
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input"
        />
      </div>
      <div>
        <label>Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input"
        >
          <option value="student">Student</option>
          <option value="professor">Professor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn-primary">
        Next
      </button>
    </form>
  );
}
