from django.db import models

# ----------------- External from auth_service -----------------
class ExternalUser(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20)
    is_2fa_enabled = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField()
    is_superuser = models.BooleanField(default=False)
    password = models.CharField(max_length=128)

    class Meta:
        managed = False
        db_table = 'users_user'

# ----------------- External from student_service -----------------
class ExternalCollege(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'student_college'

class ExternalDepartment(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    college_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_department'

class ExternalProgram(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    program_type = models.CharField(max_length=10)
    duration_years = models.PositiveIntegerField()
    department_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_program'

class ExternalStudent(models.Model):
    id = models.AutoField(primary_key=True)
    user_email = models.EmailField(unique=True)
    enrollment_year = models.PositiveIntegerField()
    program_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_student'

class ExternalCourse(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    description = models.TextField()
    professor_email = models.EmailField()
    program_id = models.IntegerField()
    year = models.PositiveIntegerField()
    semester = models.PositiveIntegerField()

    class Meta:
        managed = False
        db_table = 'student_course'

class ExternalEnrollment(models.Model):
    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    course_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_enrollment'

class ExternalAttendance(models.Model):
    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    date = models.DateField()
    present = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'student_attendance'

class ExternalCourseMark(models.Model):
    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    course_id = models.IntegerField()
    assignment_score = models.FloatField()
    midterm_score = models.FloatField()
    final_score = models.FloatField()

    class Meta:
        managed = False
        db_table = 'student_coursemark'

# ----------------- External from professor_service -----------------
class ExternalProfessor(models.Model):
    id = models.AutoField(primary_key=True)
    user_email = models.EmailField(unique=True)
    department = models.IntegerField(null=True)
    designation = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'professor_professor'

class AdminAnnouncement(models.Model):
    TARGET_TYPE_CHOICES = [
        ('all_users', 'All Users'),
        ('students', 'Students Only'),
        ('professors', 'Professors Only'),
        ('college', 'Specific College'),
        ('department', 'Specific Department'),
        ('program', 'Specific Program'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE_CHOICES)
    target_id = models.IntegerField(null=True, blank=True)  # can be College/Dept/Program id based on type

    def __str__(self):
        return self.title

class SystemSetting(models.Model):
    key = models.CharField(max_length=255, unique=True)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.key}: {self.value}"

class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('deactivate', 'Deactivate'),
        ('system_setting_change', 'System Setting Change'),
    ]

    admin_email = models.EmailField()
    action_type = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_model = models.CharField(max_length=100)  # e.g., User, College, Department, Program, Course
    target_object_id = models.IntegerField(null=True, blank=True)  # optional - id of object
    description = models.TextField(blank=True, null=True)  # optional free text
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admin_email} {self.action_type} {self.target_model} at {self.timestamp}"
