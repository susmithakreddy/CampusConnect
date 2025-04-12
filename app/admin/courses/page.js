'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";
import CourseFormModal from "./components/CourseFormModal";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) router.push('/');
      else setUser(JSON.parse(userStr));
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchPrograms();
    }
  }, [user]);

  const fetchCourses = async () => {
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/courses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPrograms = async () => {
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/programs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch programs");
      const data = await res.json();
      setPrograms(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = () => {
    setEditCourse(null);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const token = await getAccessToken();
    try {
      const res = await fetch(`http://localhost:8003/api/admin/courses/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete course");
      fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    fetchCourses();
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          + Create New Course
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
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
            {courses.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.code}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{programs.find(p => p.id === c.program_id)?.name || "N/A"}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(c)} className="btn btn-primary btn-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-error btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <CourseFormModal
          course={editCourse}
          programs={programs}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
