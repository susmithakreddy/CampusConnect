from django.db import models
from django.conf import settings
from django.utils import timezone

class ExternalUser(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField()
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20)

    class Meta:
        managed = False  # Django won't try to create or modify this table
        db_table = 'users_user'  # Must exactly match the actual table name

    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_authenticated(self):
        return True  # Always true for JWT-authenticated users

    @property
    def is_anonymous(self):
        return False
    
# College level
class College(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

# Department under a college
class Department(models.Model):
    name = models.CharField(max_length=255)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='departments')

    def __str__(self):
        return f"{self.name} ({self.college.name})"

# Program under a department (UG, PG etc.)
class Program(models.Model):
    PROGRAM_TYPE_CHOICES = (
        ('UG', 'Undergraduate'),
        ('PG', 'Postgraduate'),
    )
    name = models.CharField(max_length=255)
    program_type = models.CharField(max_length=10, choices=PROGRAM_TYPE_CHOICES)
    duration_years = models.PositiveIntegerField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')

    def __str__(self):
        return f"{self.name} ({self.get_program_type_display()})"

# Student connected to user from auth_service
class Student(models.Model):
    user_email = models.EmailField(unique=True)
    enrollment_year = models.PositiveIntegerField()
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='students')

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"

# Course offered in a specific semester/year/program
class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    professor_email = models.EmailField()  # Reference by email for now
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    year = models.PositiveIntegerField()  # 1-4 for UG, 1-2 for PG
    semester = models.PositiveIntegerField()  # 1 or 2

    def __str__(self):
        return f"{self.code} - {self.name}"

class CourseMaterial(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

# Enrollment connects student to a course
class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.user.email} in {self.course.code}"

# Assignment posted for a course
class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()

    def __str__(self):
        return f"{self.title} ({self.course.code})"

# Submission made by a student for an assignment
class Submission(models.Model):
    STATUS_CHOICES = [
        ('DUE', 'Due'),             # No submission yet
        ('SUBMITTED', 'Submitted'), # Submitted before deadline
        ('LATE', 'Late'),           # Submitted after deadline
        ('GRADED', 'Graded'),       # Graded (after submission)
    ]

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='submissions/',null=True, blank=True)
    grade = models.CharField(max_length=10, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DUE')

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"Submission by {self.student.user.email} for {self.assignment.title}"

    def save(self, *args, **kwargs):
        # Auto-set status if needed
        now = timezone.now()
        if self.assignment and self.assignment.due_date:
            if now > self.assignment.due_date and self.status not in ('GRADED'):
                self.status = 'LATE'
            elif self.grade:
                self.status = 'GRADED'
            else:
                self.status = 'SUBMITTED'
        super().save(*args, **kwargs)

# Marks for a course (assignment total + midterm + final)
class CourseMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_marks')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_marks')
    assignment_score = models.FloatField()
    midterm_score = models.FloatField()
    final_score = models.FloatField()

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.user.email} - {self.course.code} Marks"
    
    def total(self):
        return self.assignment_score + self.midterm_score + self.final_score

# Attendance tracking per course
class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    present = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.date} - {self.student.user.email} - {'Present' if self.present else 'Absent'}"

class Announcement(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('professor', 'Professor'),
        ('all', 'All'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.CharField(max_length=255)  # store user ID or email from auth_service
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    target_role = models.CharField(max_length=20, choices=ROLE_CHOICES, null=True, blank=True)
    course = models.ForeignKey('Course', on_delete=models.CASCADE, null=True, blank=True)
    is_admin_announcement = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class ExternalAdminAnnouncement(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    target_type = models.CharField(max_length=20)
    target_id = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'admins_adminannouncement'
