'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/app/utils/auth";

export default function CourseFormModal({ onClose, course, programs }) {
  const [code, setCode] = useState(course ? course.code : "");
  const [name, setName] = useState(course ? course.name : "");
  const [description, setDescription] = useState(course ? course.description : "");
  const [professorEmail, setProfessorEmail] = useState(course ? course.professor_email : "");
  const [programId, setProgramId] = useState(course ? course.program_id : "");
  const [year, setYear] = useState(course ? course.year : "");
  const [semester, setSemester] = useState(course ? course.semester : "");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programId) {
      alert("Please select a program before submitting.");
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const method = course ? "PATCH" : "POST";
    const url = course
      ? `http://localhost:8003/api/admin/courses/${course.id}/`
      : `http://localhost:8003/api/admin/courses/`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          name,
          description,
          professor_email: professorEmail,
          program_id: parseInt(programId, 10),
          year: parseInt(year, 10),
          semester: parseInt(semester, 10),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.detail || "Failed to save course.");
        return;
      }

      onClose();
    } catch (error) {
      console.error("Unexpected error submitting course form:", error);
      alert("Something went wrong while saving course.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6">
        <h2 className="text-xl font-bold">{course ? "Edit Course" : "Create Course"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Course Code</label>
            <input
              className="input input-bordered w-full"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Course Name</label>
            <input
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Description</label>
            <textarea
              className="input input-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Professor Email</label>
            <input
              className="input input-bordered w-full"
              type="email"
              value={professorEmail}
              onChange={(e) => setProfessorEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Program</label>
            <select
              className="input input-bordered w-full"
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              required
            >
              <option value="">Select Program</option>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Year</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Semester</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {course ? "Save" : "Create"}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
