from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import (
    Student, College, Department, Program, Course,
    Enrollment, Assignment, Submission, Attendance,
    CourseMark, Announcement,CourseMaterial,ExternalAdminAnnouncement
)

from .serializers import (
    StudentSerializer, CollegeSerializer, DepartmentSerializer, ProgramSerializer,
    CourseSerializer, EnrollmentSerializer, AssignmentSerializer,
    SubmissionSerializer, AttendanceSerializer, CourseMarkSerializer,
    AnnouncementSerializer,CourseMaterialSerializer,AdminAnnouncementSerializer
)

import logging
from django.db.models import Q

logger = logging.getLogger(__name__)

# --- Reusable Base ---
class ReadOnlyModelViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

# --- Basic Reference Models (no filtering) ---
class CollegeViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = College.objects.all()
    serializer_class = CollegeSerializer

class DepartmentViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class ProgramViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer

# --- Filtered Views (student-specific) ---
class StudentViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer

    def get_queryset(self):
        return Student.objects.select_related('program__department', 'program__department__college', 'program').filter(user_email=self.request.user.email)

class CourseViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        user_email = self.request.user.email
        enrolled_course_ids = Enrollment.objects.filter(
            student__user_email=user_email
        ).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=enrolled_course_ids)
    
    @action(detail=True, methods=['get'], url_path='assignments')
    def assignments(self, request, pk=None):
        course = self.get_object()
        assignments = Assignment.objects.filter(course=course)
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    # Nested: /api/student/courses/<id>/announcements/
    def announcements(self, request, pk=None):
        course = self.get_object()
        announcements = Announcement.objects.filter(course=course).order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)

    # Nested: /api/student/courses/<id>/materials/
    @action(detail=True, methods=['get'], url_path='materials')
    def materials(self, request, pk=None):
        course = self.get_object()
        materials = CourseMaterial.objects.filter(course=course)
        serializer = CourseMaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data)

    # Nested: /api/student/courses/<id>/marks/
    @action(detail=True, methods=['get'], url_path='marks')
    def marks(self, request, pk=None):
        course = self.get_object()
        user = request.user
        try:
            student = Student.objects.get(user_email=user.email)
        except Student.DoesNotExist:
            return Response({'detail': 'Student not found.'}, status=404)

        mark = CourseMark.objects.filter(course=course, student=student).first()
        if mark is None:
            return Response({'detail': 'Marks not found for this course.Are you enrolled in this course'}, status=404)

        serializer = CourseMarkSerializer(mark)
        return Response(serializer.data)


    # Nested: /api/student/courses/<id>/attendance/
    @action(detail=True, methods=['get'], url_path='attendance')
    def attendance(self, request, pk=None):
        course = self.get_object()
        user = request.user
        try:
            student = Student.objects.get(user_email=user.email)
        except Student.DoesNotExist:
            return Response({'detail': 'Student not found.'}, status=404)

        records = Attendance.objects.filter(course=course, student=student)
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)

class EnrollmentViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(student__user_email=self.request.user.email)

class AssignmentViewSet(ReadOnlyModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_email = self.request.user.email
        logger.debug(f"Fetching assignments for user: {user_email}")
        enrolled_course_ids = Enrollment.objects.filter(
            student__user_email=self.request.user.email
        ).values_list('course_id', flat=True)
        return Assignment.objects.filter(course_id__in=enrolled_course_ids).order_by('-due_date')

class AttendanceViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        qs = Attendance.objects.filter(student__user_email=self.request.user.email)

        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)

        month = self.request.query_params.get('month')
        if month:
            qs = qs.filter(date__month=month)

        return qs


class CourseMarkViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseMarkSerializer

    def get_queryset(self):
        qs = CourseMark.objects.filter(student__user_email=self.request.user.email)
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


# --- Submission Upload (Write-enabled) ---
class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Submission.objects.filter(student__user_email=self.request.user.email)

    def create(self, request, *args, **kwargs):
        # Step 1: Identify the student using the email from request.user.
        student = Student.objects.filter(user_email=request.user.email).first()
        if not student:
            return Response({"detail": "No matching student found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Step 2: Overwrite incoming data to ensure the correct student is used.
        mutable_data = request.data.copy()
        mutable_data['student'] = student.id  # Link via primary key

        # Step 3: Validate that the assignment ID is provided.
        assignment_id = mutable_data.get('assignment')
        if not assignment_id:
            return Response({"detail": "Assignment ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"detail": "Assignment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Step 4: Delete any existing submission by this student for the same assignment.
        existing_submission = Submission.objects.filter(student=student, assignment=assignment).first()
        if existing_submission:
            existing_submission.delete()  # Remove the old file

        # Step 5: Validate and create the new submission.
        serializer = self.get_serializer(data=mutable_data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

# --- Announcements (course & admin) ---
class AnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminAnnouncementSerializer
    pagination_class = None 

    def get_queryset(self):
        user_email = self.request.user.email
        student = Student.objects.filter(user_email=user_email).first()

        program = Program.objects.filter(id=student.program_id).first()
        department = Department.objects.filter(id=program.department_id).first()
        college = College.objects.filter(id=department.college_id).first()

        return ExternalAdminAnnouncement.objects.filter(
            Q(target_type='all_users') |
            Q(target_type='students') |
            Q(target_type='program', target_id=program.id) |
            Q(target_type='department', target_id=department.id) |
            Q(target_type='college', target_id=college.id)
        ).order_by('-created_at')