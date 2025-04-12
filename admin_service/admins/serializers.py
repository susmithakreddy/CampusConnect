from datetime import timezone
from requests import Response
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    ExternalUser,
    ExternalCollege,
    ExternalDepartment,
    ExternalProgram,
    ExternalStudent,
    ExternalProfessor,
    ExternalCourse,
    ExternalEnrollment,
    ExternalAttendance,
    ExternalCourseMark,
    AdminAnnouncement,
    SystemSetting,
    ActivityLog

)

# ------------------- Users -------------------
class ExternalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalUser
        fields = '__all__'

# ------------------- Colleges -------------------
class ExternalCollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCollege
        fields = '__all__'

class ExternalDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalDepartment
    fields = '__all__'

class ExternalProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalProgram
        fields = '__all__'

# ------------------- Students -------------------
class ExternalStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalStudent
        fields = '__all__'

# ------------------- Professors -------------------
class ExternalProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalProfessor
        fields = '__all__'

# ------------------- Courses -------------------
class ExternalCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCourse
        fields = '__all__'

from django.utils import timezone
from rest_framework import serializers
from .models import ExternalUser, ExternalStudent, ExternalProfessor, ExternalEnrollment

class UserCreateSerializer(serializers.ModelSerializer):
    program_id = serializers.IntegerField(required=False)
    department_id = serializers.IntegerField(required=False)
    course_ids = serializers.ListField(child=serializers.IntegerField(), required=False)

    class Meta:
        model = ExternalUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_2fa_enabled', 'program_id', 'department_id', 'course_ids']

    def validate(self, attrs):
        first_name = attrs.get('first_name')
        last_name = attrs.get('last_name')
        email = attrs.get('email')

        if not email and first_name and last_name:
            generated_email = f"{first_name.lower()}.{last_name.lower()}@heritage.edu.in"
            attrs['email'] = generated_email

        role = attrs.get('role')
        program_id = attrs.get('program_id')
        department_id = attrs.get('department_id')

        if role == 'student' and not program_id:
            raise serializers.ValidationError("program_id is required when creating a student.")
        if role == 'professor' and not department_id:
            raise serializers.ValidationError("department_id is required when creating a professor.")

        return attrs

    def create(self, validated_data):
        role = validated_data.get('role')
        program_id = validated_data.pop('program_id', None)
        department_id = validated_data.pop('department_id', None)
        course_ids = validated_data.pop('course_ids', [])

        is_staff = False
        is_superuser = False

        if role == 'admin':
            is_staff = True
            is_superuser = True  # Only True if you are making full Django admin (not needed here)

        user = ExternalUser.objects.create(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role'],
            is_active=validated_data.get('is_active', True),
            is_2fa_enabled=validated_data.get('is_2fa_enabled', True),
            date_joined=timezone.now(),
            is_staff=is_staff,
            is_superuser=is_superuser,
            password=make_password('CampusConnect@123')
        )

        if role == 'student' and program_id:
            student = ExternalStudent.objects.create(
                user_email=user.email,
                program_id=program_id,
                enrollment_year=timezone.now().year
            )
            for course_id in course_ids:
                ExternalEnrollment.objects.create(
                    student_id=student.id,
                    course_id=course_id
                )

        elif role == 'professor' and department_id:
            ExternalProfessor.objects.create(
                user_email=user.email,
                department=department_id,
                designation=''
            )

        return user

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_2fa_enabled']

class UserDetailSerializer(serializers.ModelSerializer):
    program = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    enrollments = serializers.SerializerMethodField()
    attendance = serializers.SerializerMethodField()
    marks = serializers.SerializerMethodField()
    courses_teaching = serializers.SerializerMethodField()

    class Meta:
        model = ExternalUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_2fa_enabled',
            'program', 'department', 'enrollments', 'attendance', 'marks', 'courses_teaching'
        ]

    def get_program(self, obj):
        if obj.role == 'student':
            try:
                student = ExternalStudent.objects.get(user_email=obj.email)
                program = ExternalProgram.objects.get(id=student.program_id)
                return program.name
            except:
                return None
        return None

    def get_department(self, obj):
        if obj.role == 'professor':
            try:
                prof = ExternalProfessor.objects.get(user_email=obj.email)
                dept = ExternalDepartment.objects.get(id=prof.department)
                return dept.name
            except:
                return None
        return None

    def get_enrollments(self, obj):
        if obj.role == 'student':
            try:
                student = ExternalStudent.objects.get(user_email=obj.email)
                enrollments = ExternalEnrollment.objects.filter(student_id=student.id)
                return [{'course_id': e.course_id} for e in enrollments]
            except:
                return []
        return []

    def get_attendance(self, obj):
        if obj.role == 'student':
            try:
                student = ExternalStudent.objects.get(user_email=obj.email)
                attendance = ExternalAttendance.objects.filter(student_id=student.id)
                return [{'course_id': a.course_id, 'date': a.date, 'present': a.present} for a in attendance]
            except:
                return []
        return []

    def get_marks(self, obj):
        if obj.role == 'student':
            try:
                student = ExternalStudent.objects.get(user_email=obj.email)
                marks = ExternalCourseMark.objects.filter(student_id=student.id)
                return [{'course_id': m.course_id, 'assignment_score': m.assignment_score, 'midterm_score': m.midterm_score, 'final_score': m.final_score} for m in marks]
            except:
                return []
        return []

    def get_courses_teaching(self, obj):
        if obj.role == 'professor':
            try:
                return list(ExternalCourse.objects.filter(professor_email=obj.email).values('id', 'name', 'code'))
            except:
                return []
        return []

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCollege
        fields = ['id', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalDepartment
        fields = ['id', 'name', 'college_id']

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalProgram
        fields = ['id', 'name', 'program_type', 'duration_years', 'department_id']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCourse
        fields = ['id', 'code', 'name', 'description', 'professor_email', 'program_id', 'year', 'semester']

class AdminAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminAnnouncement
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value']
        extra_kwargs = {
                'key': {'required': False},
                'value': {'required': True},
            }

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'