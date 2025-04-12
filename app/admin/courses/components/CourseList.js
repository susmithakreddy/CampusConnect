'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import CourseFormModal from "./CourseFormModal";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchPrograms = async () => {
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8003/api/admin/programs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch programs");
      const data = await res.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleCreateClick = () => {
    setEditCourse(null);
    setShowModal(true);
  };

  const handleEditClick = (course) => {
    setEditCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8003/api/admin/courses/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");

      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      {/* Create Button aligned to right */}
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={handleCreateClick}>
          + Create New Course
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg mt-4">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Program</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{course.id}</td>
                <td className="p-3">{course.code}</td>
                <td className="p-3">{course.name}</td>
                <td className="p-3">{programs.find((p) => p.id === course.program_id)?.name || "N/A"}</td>
                <td className="p-3 space-x-2">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(course)}>
                    Edit
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => handleDelete(course.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CourseFormModal
          programs={programs}
          course={editCourse}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
