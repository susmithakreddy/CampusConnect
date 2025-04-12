from rest_framework import serializers
from .models import (
    ExternalUser,
    ExternalCourse,
    ExternalAssignment,
    ExternalStudent,
    ExternalSubmission,
    ExternalAttendance,
    ExternalCourseMark,
    ExternalAnnouncement,
    Professor,
    ProfessorMaterial,
    ProfessorAssignment,
    ExternalCourseMaterial,
    ExternalAdminAnnouncement
)

class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = '__all__'

class ProfessorAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessorAssignment
        fields = '__all__'
        read_only_fields = ['course_id']


class ExternalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalUser
        fields = ('email', 'first_name', 'last_name', 'role')

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCourse
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalAssignment
        fields = '__all__'

class ProfessorMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProfessorMaterial
        fields = ['id', 'course_id', 'title', 'description', 'file', 'file_url', 'uploaded_at']
        read_only_fields = ['id', 'course_id', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
class CourseMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalCourseMaterial
        fields = '__all__'

class SubmissionSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student.user_email', read_only=True)

    class Meta:
        model = ExternalSubmission
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student.user_email', read_only=True)

    class Meta:
        model = ExternalAttendance
        fields = '__all__'

class CourseMarkSerializer(serializers.ModelSerializer):
    student_email = serializers.EmailField(source='student.user_email', read_only=True)

    class Meta:
        model = ExternalCourseMark
        fields = ['id', 'student_id', 'course_id', 'assignment_score', 'midterm_score', 'final_score','student_email']

class AnnouncementSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = ExternalAnnouncement
        fields = '__all__'

class AdminAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalAdminAnnouncement
        fields = '__all__'

