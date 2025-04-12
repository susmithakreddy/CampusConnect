'use client';

import { useState, useEffect } from "react";

export default function UserProfileForm({ role, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;
        if (role === "student") {
          const programsRes = await fetch(`http://localhost:8003/api/admin/programs/`, { headers: { Authorization: `Bearer ${token}` } });
          const coursesRes = await fetch(`http://localhost:8003/api/admin/courses/`, { headers: { Authorization: `Bearer ${token}` } });
          setPrograms(await programsRes.json());
          setCourses(await coursesRes.json());
        }
        if (role === "professor") {
          const departmentsRes = await fetch(`http://localhost:8003/api/admin/departments/`, { headers: { Authorization: `Bearer ${token}` } });
          setDepartments(await departmentsRes.json());
        }
      } catch (err) {
        console.error('Error loading dropdowns:', err);
      }
    }
    fetchOptions();
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setFormData({ ...formData, course_ids: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {role === "student" && (
        <>
          <div>
            <label>Program</label>
            <select name="program_id" onChange={handleChange} required className="input">
              <option value="">Select Program</option>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>{prog.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Enrollment Year</label>
            <input
              name="enrollment_year"
              type="number"
              placeholder="2025"
              onChange={handleChange}
              required
              className="input"
            />
          </div>
          <div>
            <label>Assign Courses</label>
            <select
              name="course_ids"
              multiple
              onChange={handleMultiSelectChange}
              className="input"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {role === "professor" && (
        <>
          <div>
            <label>Department</label>
            <select name="department_id" onChange={handleChange} required className="input">
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Designation</label>
            <input
              name="designation"
              type="text"
              placeholder="Assistant Professor"
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </>
      )}

      <button type="submit" className="btn-primary">
        Create User
      </button>
    </form>
  );
}
