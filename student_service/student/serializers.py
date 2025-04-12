from rest_framework import serializers
from .models import (
    Student, College, Department, Program, Course,
    Enrollment, Assignment, Submission, Attendance, CourseMark, Announcement,CourseMaterial,ExternalAdminAnnouncement
)
from django.contrib.auth import get_user_model

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id', 'email', 'first_name', 'last_name', 'role']


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'
        read_only_fields = [f.name for f in College._meta.fields]


class DepartmentSerializer(serializers.ModelSerializer):
    college = CollegeSerializer()

    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = [f.name for f in Department._meta.fields]


class ProgramSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer()

    class Meta:
        model = Program
        fields = '__all__'
        read_only_fields = [f.name for f in Program._meta.fields]


class CourseSerializer(serializers.ModelSerializer):
    program = ProgramSerializer()

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = [f.name for f in Course._meta.fields]


class StudentSerializer(serializers.ModelSerializer):
    college = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    program = ProgramSerializer()
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = [f.name for f in Student._meta.fields]

    def get_college(self, obj):
        if obj.program and obj.program.department and obj.program.department.college:
            return {
                "id": obj.program.department.college.id,
                "name": obj.program.department.college.name
            }
        return None

    def get_department(self, obj):
        if obj.program and obj.program.department:
            return {
                "id": obj.program.department.id,
                "name": obj.program.department.name
            }
        return None


class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer()

    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = [f.name for f in Enrollment._meta.fields]


class AssignmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer()

    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = [f.name for f in Assignment._meta.fields]



'''class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = [f.name for f in Submission._meta.fields if f.name not in ['assignment', 'file_url']]'''
class SubmissionSerializer(serializers.ModelSerializer):
    # assignment is required, so user picks which assignment
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all())
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    file = serializers.FileField(required=True)  # Expect a file in multipart form data
    status = serializers.CharField(read_only=True)
    grade = serializers.CharField(read_only=True)
    feedback = serializers.CharField(read_only=True)

    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['id', 'student', 'submitted_at', 'status', 'grade', 'feedback']
    
    def get_file_url(self, obj):
        # If we have a request in context (which we set in the view),
        # we can build an absolute URL. Otherwise, fallback to relative path.
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def create(self, validated_data):
        return super().create(validated_data)




class AttendanceSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer()

    class Meta:
        model = Attendance
        fields = '__all__'



class CourseMarkSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    course = CourseSerializer()

    class Meta:
        model = CourseMark
        fields = '__all__'
        read_only_fields = [f.name for f in CourseMark._meta.fields]
    


class CourseBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name']
        read_only_fields = ['id', 'name']

class CourseMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    class Meta:
        model = CourseMaterial
        fields = ['id', 'title', 'description', 'file_url', 'uploaded_at']
    def get_file_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url 


class AdminAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalAdminAnnouncement
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    course = CourseBasicSerializer(read_only=True)
    source = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'message', 'created_at', 'course', 'source']
        read_only_fields = ['id', 'title', 'message', 'created_at', 'course', 'source']

