export const API_BASES = {
    auth: process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:8000/api',
    student: process.env.NEXT_PUBLIC_STUDENT_API || 'http://localhost:8001/api',
    professor: process.env.NEXT_PUBLIC_PROFESSOR_API || 'http://localhost:8002/api',
    admin: process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8003/api',
  };
  