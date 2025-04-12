from student.models import ExternalUser, College, Department, Program, Student, Course, Enrollment, Assignment, Submission, Attendance, CourseMark, Announcement
from django.utils import timezone
from datetime import timedelta

# Helper
def get_user(email):
    return ExternalUser.objects.get(email=email)

# College, Department, Program
college, _ = College.objects.get_or_create(name="Heritage College of Engineering")
department, _ = Department.objects.get_or_create(name="Computer Science", college=college)
program, _ = Program.objects.get_or_create(
    name="B.Tech CSE",
    program_type="UG",
    duration_years=4,
    department=department
)

# Students
student1_email = "alice.johnson@heritage.edu.in"
student2_email = "bob.smith@heritage.edu.in"
student1, _ = Student.objects.get_or_create(user_email=student1_email, enrollment_year=2023, program=program)
student2, _ = Student.objects.get_or_create(user_email=student2_email, enrollment_year=2023, program=program)

# Professor
prof_email = "carol.james@heritage.edu.in"

# Courses
course1, _ = Course.objects.get_or_create(
    code="CS201",
    defaults={
        "name": "Data Structures",
        "description": "Intro to stacks, queues, trees, and graphs",
        "professor_email": prof_email,
        "program": program,
        "year": 2,
        "semester": 1,
    }
)

course2, _ = Course.objects.get_or_create(
    code="CS101",
    defaults={
        "name": "Introduction to Programming",
        "description": "Python programming basics",
        "professor_email": prof_email,
        "program": program,
        "year": 1,
        "semester": 1,
    }
)

# Enroll students
Enrollment.objects.get_or_create(student=student1, course=course1)
Enrollment.objects.get_or_create(student=student2, course=course1)
Enrollment.objects.get_or_create(student=student1, course=course2)

# Assignments
due1 = timezone.now() + timedelta(days=7)
assignment1, _ = Assignment.objects.get_or_create(
    course=course1,
    title="Stacks and Queues",
    defaults={"description": "Implement a stack and queue in Python.", "due_date": due1}
)

due2 = timezone.now() + timedelta(days=10)
assignment2, _ = Assignment.objects.get_or_create(
    course=course2,
    title="Hello World Project",
    defaults={"description": "Write your first Python program.", "due_date": due2}
)

# Submissions
Submission.objects.get_or_create(
    assignment=assignment1,
    student=student1,
    defaults={
        "submitted_at": timezone.now(),
        "file_url": "http://example.com/alice_stack.pdf",
        "feedback": "Well done!",
        "grade": "90"
    }
)

Submission.objects.get_or_create(
    assignment=assignment1,
    student=student2,
    defaults={
        "submitted_at": timezone.now(),
        "file_url": "http://example.com/bob_stack.pdf",
        "feedback": "Missing edge cases",
        "grade": "75"
    }
)

# Attendance
Attendance.objects.get_or_create(student=student1, course=course1, date=timezone.now().date(), present=True)
Attendance.objects.get_or_create(student=student2, course=course1, date=timezone.now().date(), present=False)
Attendance.objects.get_or_create(student=student1, course=course2, date=timezone.now().date(), present=True)

# Course Marks
CourseMark.objects.get_or_create(
    student=student1,
    course=course1,
    defaults={"assignment_score": 90, "midterm_score": 85, "final_score": 88}
)

CourseMark.objects.get_or_create(
    student=student2,
    course=course1,
    defaults={"assignment_score": 75, "midterm_score": 70, "final_score": 72}
)

# Announcements
Announcement.objects.get_or_create(
    title="Assignment 1 Deadline",
    message="The deadline for Assignment 1 is extended by 2 days.",
    created_by=prof_email,
    course=course1,
    is_admin_announcement=False,
    target_role="student"
)

Announcement.objects.get_or_create(
    title="Course Welcome",
    message="Welcome to Data Structures!",
    created_by=prof_email,
    course=course1,
    is_admin_announcement=False,
    target_role="student"
)

print("✅ Student service data populated successfully!")
