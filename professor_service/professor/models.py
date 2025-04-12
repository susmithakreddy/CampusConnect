from django.db import models

# External models from student_service
class ExternalUser(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField()
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'users_user'
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_authenticated(self):
        return True  # Always true for JWT-authenticated users

    @property
    def is_anonymous(self):
        return False

class ExternalCollege(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'student_college'

class ExternalDepartment(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    college = models.ForeignKey(ExternalCollege, on_delete=models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'student_department'

class ExternalProgram(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    program_type = models.CharField(max_length=10)
    duration_years = models.PositiveIntegerField()
    department = models.ForeignKey(ExternalDepartment, on_delete=models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'student_program'

class ExternalStudent(models.Model):
    id = models.AutoField(primary_key=True)
    user_email = models.EmailField(unique=True)
    enrollment_year = models.PositiveIntegerField()
    program = models.ForeignKey(ExternalProgram, on_delete=models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'student_student'
class ExternalEnrollment(models.Model):
    id = models.AutoField(primary_key=True)
    student_id = models.IntegerField()
    course_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_enrollment' 

class ExternalCourse(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    description = models.TextField()
    professor_email = models.EmailField()
    program = models.ForeignKey(ExternalProgram, on_delete=models.DO_NOTHING)
    year = models.PositiveIntegerField()
    semester = models.PositiveIntegerField()

    class Meta:
        managed = False
        db_table = 'student_course'

class ExternalAssignment(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(ExternalCourse, on_delete=models.DO_NOTHING)
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'student_assignment'

class ExternalSubmission(models.Model):
    id = models.AutoField(primary_key=True)
    assignment = models.ForeignKey(ExternalAssignment, on_delete=models.DO_NOTHING)
    student = models.ForeignKey(ExternalStudent, on_delete=models.DO_NOTHING)
    submitted_at = models.DateTimeField()
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    grade = models.CharField(max_length=10, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'student_submission'

class ExternalAttendance(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(ExternalStudent, on_delete=models.DO_NOTHING)
    course = models.ForeignKey(ExternalCourse, on_delete=models.DO_NOTHING)
    date = models.DateField()
    present = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'student_attendance'

class ExternalCourseMark(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(ExternalStudent, on_delete=models.DO_NOTHING)
    course = models.ForeignKey(ExternalCourse, on_delete=models.DO_NOTHING)
    assignment_score = models.FloatField()
    midterm_score = models.FloatField()
    final_score = models.FloatField()

    class Meta:
        managed = False
        db_table = 'student_coursemark'

class ExternalCourseMaterial(models.Model):
    id = models.AutoField(primary_key=True)
    course = models.ForeignKey(ExternalCourse, on_delete=models.CASCADE, related_name='external_materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='materials/')
    uploaded_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'student_coursematerial'

    def __str__(self):
        return self.title

class ExternalAnnouncement(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    target_role = models.CharField(max_length=20, null=True, blank=True)
    course = models.ForeignKey(ExternalCourse, on_delete=models.DO_NOTHING, null=True, blank=True)
    is_admin_announcement = models.BooleanField(default=False)

    class Meta:
        managed = False
        db_table = 'student_announcement'

class ExternalAdminAnnouncement(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.CharField(max_length=255)
    created_by_role = models.CharField(max_length=20, default='admin')  # optional if you added earlier
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    target_type = models.CharField(max_length=20)
    target_id = models.IntegerField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'admins_adminannouncement'

# Local Professor Models

class Professor(models.Model):
    user_email = models.EmailField(unique=True)
    department = models.IntegerField(null=True)
    designation = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.user_email

class ProfessorMaterial(models.Model):
    course_id = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='professor_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class ProfessorAssignment(models.Model):
    course_id = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


