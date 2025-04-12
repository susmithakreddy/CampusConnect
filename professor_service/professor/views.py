from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.db.models import Q
from .models import (
    ExternalUser,
    ExternalCourse,
    ExternalAssignment,
    ExternalStudent,
    ExternalSubmission,
    ExternalAttendance,
    ExternalCourseMark,
    ExternalAnnouncement,
    ExternalCollege,
    ExternalDepartment,
    Professor,
    ProfessorMaterial,
    ProfessorAssignment,
    ExternalCourseMaterial,
    ExternalEnrollment,
    ExternalAdminAnnouncement
)
from .serializers import (
    ProfessorSerializer,
    ExternalUserSerializer,
    CourseSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    AttendanceSerializer,
    CourseMarkSerializer,
    AnnouncementSerializer,
    ProfessorMaterialSerializer,
    ProfessorAssignmentSerializer,
    CourseMaterialSerializer,
    AdminAnnouncementSerializer
)
from rest_framework.decorators import action
from django.utils.dateparse import parse_date
import csv
from io import TextIOWrapper

class ProfessorViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfessorSerializer

    def get_queryset(self):
        return Professor.objects.filter(user_email=self.request.user.email)

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return ExternalCourse.objects.filter(professor_email=self.request.user.email)

    @action(detail=True, methods=['get'], url_path='overview')
    def overview(self, request, pk=None):
        course = self.get_object()

        # Manually filter students enrolled in this course
        enrolled_student_ids = ExternalEnrollment.objects.filter(course_id=course.id).values_list('student_id', flat=True)
        students = ExternalStudent.objects.filter(id__in=enrolled_student_ids)

        student_data = [
            {
                "student_id": s.id,
                "student_email": s.user_email,
            }
            for s in students
        ]

        return Response({
            "course": {
                "id": course.id,
                "name": course.name,
                "code": course.code,
                "description": course.description,
            },
            "students": student_data
        })

    @action(detail=True, methods=['get', 'post', 'delete'], url_path='materials')
    def materials(self, request, pk=None):
        course = self.get_object()

        if request.method == 'GET':
            external_materials = ExternalCourseMaterial.objects.filter(course_id=course.id)
            professor_materials = ProfessorMaterial.objects.filter(course_id=course.id)

            external_data = CourseMaterialSerializer(external_materials, many=True, context={'request': request}).data
            professor_data = ProfessorMaterialSerializer(professor_materials, many=True, context={'request': request}).data

            combined = external_data + professor_data
            combined.sort(key=lambda x: x.get('uploaded_at', ''))

            return Response(combined)

        if request.method == 'POST':
            serializer = ProfessorMaterialSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(course_id=course.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'DELETE':
            material_id = request.data.get('material_id')
            try:
                material = ProfessorMaterial.objects.get(id=material_id, course_id=course.id)
                material.delete()
                return Response({'success': 'Material deleted.'}, status=status.HTTP_204_NO_CONTENT)
            except ProfessorMaterial.DoesNotExist:
                return Response({'error': 'Material not found or cannot be deleted.'}, status=status.HTTP_404_NOT_FOUND)

    # --- ANNOUNCEMENTS ---
    @action(detail=True, methods=['get', 'post', 'delete'], url_path='announcements')
    def course_announcements(self, request, pk=None):
        course = self.get_object()

        if request.method == 'GET':
            announcements = ExternalAnnouncement.objects.filter(
                course_id=course.id,
                is_admin_announcement=False
            ).order_by('-created_at')
            return Response(AnnouncementSerializer(announcements, many=True).data)

        if request.method == 'POST':
            title = request.data.get('title')
            message = request.data.get('message')

            if not title or not message:
                return Response({'error': 'Title and Message are required.'}, status=status.HTTP_400_BAD_REQUEST)

            announcement = ExternalAnnouncement.objects.create(
                title=title,
                message=message,
                created_by=request.user.email,
                course_id=course.id,
                is_admin_announcement=False,
                target_role='student'
            )
            return Response(AnnouncementSerializer(announcement).data, status=status.HTTP_201_CREATED)

        if request.method == 'DELETE':
            announcement_id = request.data.get('announcement_id')
            try:
                announcement = ExternalAnnouncement.objects.get(id=announcement_id, course_id=course.id, is_admin_announcement=False)
                announcement.delete()
                return Response({'success': 'Announcement deleted.'}, status=status.HTTP_204_NO_CONTENT)
            except ExternalAnnouncement.DoesNotExist:
                return Response({'error': 'Announcement not found or cannot be deleted.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get', 'post'], url_path='assignments')
    def assignments(self, request, pk=None):
        course = self.get_object()

        if request.method == 'GET':
            # Fetch from both external and professor-created assignments
            external_assignments = ExternalAssignment.objects.filter(course_id=course.id)
            professor_assignments = ProfessorAssignment.objects.filter(course_id=course.id)

            # Serialize separately
            external_data = AssignmentSerializer(external_assignments, many=True).data
            professor_data = ProfessorAssignmentSerializer(professor_assignments, many=True).data

            # Combine
            combined = external_data + professor_data

            # Optional: sort by due_date if you want
            combined.sort(key=lambda x: x['due_date'])

            return Response(combined)


        if request.method == 'POST':
            serializer = ProfessorAssignmentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(course_id=course.id)  # <<< Set course_id here properly
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='update-description')
    def update_description(self, request, pk=None):
        course = self.get_object()
        new_description = request.data.get('description')
        if not new_description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Because ExternalCourse is managed=False, we cannot save it here
        # Instead, we would normally trigger an update in student_service
        # Here, you can just raise 501 Not Implemented for now
        return Response({'detail': 'Course description update not yet implemented.'}, status=status.HTTP_501_NOT_IMPLEMENTED)

class AssignmentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        professor_assignments = ProfessorAssignment.objects.all()
        external_assignments = ExternalAssignment.objects.filter(course__professor_email=request.user.email)

        professor_data = ProfessorAssignmentSerializer(professor_assignments, many=True, context={'request': request}).data
        external_data = AssignmentSerializer(external_assignments, many=True).data
        for item in external_data:
            item['source'] = 'external'
        for item in professor_data:
            item['source'] = 'professor'
        
        combined = external_data + professor_data
        combined.sort(key=lambda x: x['due_date'])

        return Response(combined)

    def retrieve(self, request, pk=None):
        try:
            assignment = ProfessorAssignment.objects.get(pk=pk)
            assignment_data = ProfessorAssignmentSerializer(assignment, context={'request': request}).data
        except ProfessorAssignment.DoesNotExist:
            try:
                assignment = ExternalAssignment.objects.get(pk=pk)
                assignment_data = AssignmentSerializer(assignment, context={'request': request}).data
            except ExternalAssignment.DoesNotExist:
                return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch submissions
        submissions = ExternalSubmission.objects.filter(assignment_id=pk)
        submissions_data = []
        for submission in submissions:
            submissions_data.append({
                'submission_id': submission.id,
                'student_id': submission.student_id,
                'student_email': submission.student.user_email if submission.student else '',
                'submission_file_url': request.build_absolute_uri(submission.file.url) if submission.file else None,
                'status': submission.status,
                'grade': submission.grade,
                'feedback': submission.feedback,
            })

        return Response({
            'assignment': assignment_data,
            'submissions': submissions_data
        })

    def partial_update(self, request, pk=None):
        try:
            assignment = ProfessorAssignment.objects.get(pk=pk)
            serializer = ProfessorAssignmentSerializer(assignment, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ProfessorAssignment.DoesNotExist:
            return Response({'error': 'Only professor-created assignments are editable.'}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, pk=None):
        try:
            # Try professor assignment
            assignment = ProfessorAssignment.objects.get(pk=pk)
            assignment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProfessorAssignment.DoesNotExist:
            try:
                # Try external assignment (simulate delete)
                external = ExternalAssignment.objects.get(pk=pk)
                external.delete()  # this will actually not work without permissions, so maybe mark deleted or soft-delete
                return Response(status=status.HTTP_204_NO_CONTENT)
            except ExternalAssignment.DoesNotExist:
                return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)


class SubmissionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubmissionSerializer
    @action(detail=True, methods=['patch'], url_path='grade')
    def grade_submission(self, request, pk=None):
        try:
            submission = ExternalSubmission.objects.get(pk=pk)
        except ExternalSubmission.DoesNotExist:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only grade and feedback can be updated
        grade = request.data.get('grade')
        feedback = request.data.get('feedback')

        if grade is not None:
            submission.grade = grade

        if feedback is not None:
            submission.feedback = feedback

        submission.save()

        return Response({
            'detail': 'Submission updated successfully.',
            'submission_id': submission.id,
            'grade': submission.grade,
            'feedback': submission.feedback
        })

    def get_queryset(self):
        return ExternalSubmission.objects.filter(assignment__course__professor_email=self.request.user.email)

class AttendanceViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        course_id = request.query_params.get('course_id')
        date = request.query_params.get('date')

        if not course_id or not date:
            return Response({'error': 'course_id and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = ExternalCourse.objects.get(pk=course_id)
        except ExternalCourse.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        students = ExternalStudent.objects.filter(program_id=course.program_id)

        attendance_records = []
        for student in students:
            attendance = ExternalAttendance.objects.filter(course_id=course.id, student_id=student.id, date=date).first()
            attendance_records.append({
                'student_id': student.id,
                'student_email': student.user_email,
                'present': attendance.present if attendance else None,
                'attendance_id': attendance.id if attendance else None,
            })

        return Response(attendance_records)

    def create(self, request):
        course_id = request.data.get('course_id')
        date_str = request.data.get('date')
        attendances = request.data.get('attendances', [])

        if not course_id or not date_str:
            return Response({'error': 'course_id and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        date = parse_date(date_str)
        if not date:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        for entry in attendances:
            student_id = entry.get('student_id')
            present = entry.get('present')

            if student_id is None or present is None:
                continue  # skip invalid rows

            obj, created = ExternalAttendance.objects.update_or_create(
                course_id=course_id,
                student_id=student_id,
                date=date,
                defaults={'present': present}
            )

        return Response({'detail': 'Attendance saved successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_attendance(self, request):
        """
        POST /api/professor/attendance/upload/
        Upload attendance CSV file
        """
        file = request.FILES.get('file')
        course_id = request.data.get('course_id')
        date_str = request.data.get('date')

        if not file or not course_id or not date_str:
            return Response({'error': 'file, course_id, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        date = parse_date(date_str)
        if not date:
            return Response({'error': 'Invalid date format.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = TextIOWrapper(file.file, encoding='utf-8')
            reader = csv.DictReader(decoded_file)
            for row in reader:
                email = row.get('student_email')
                present_str = row.get('present', '').lower()

                if email and present_str in ('yes', 'no'):
                    try:
                        student = ExternalStudent.objects.get(user_email=email)
                        present = True if present_str == 'yes' else False

                        ExternalAttendance.objects.update_or_create(
                            course_id=course_id,
                            student_id=student.id,
                            date=date,
                            defaults={'present': present}
                        )
                    except ExternalStudent.DoesNotExist:
                        continue  # Skip if student not found
        except Exception as e:
            return Response({'error': f'File processing failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Bulk upload completed successfully.'}, status=status.HTTP_200_OK)

class CourseMarkViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        marks = ExternalCourseMark.objects.filter(course__professor_email=request.user.email)
        serializer = CourseMarkSerializer(marks, many=True)
        return Response(serializer.data)

    def create(self, request):
        data = request.data

        required_fields = ['course_id', 'student_id', 'assignment_score', 'midterm_score', 'final_score']
        for field in required_fields:
            if field not in data:
                return Response({field: "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        course_id = data.get('course_id')
        student_id = data.get('student_id')

        try:
            course = ExternalCourse.objects.get(id=course_id, professor_email=request.user.email)
        except ExternalCourse.DoesNotExist:
            return Response({'detail': 'Invalid course or permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        mark, created = ExternalCourseMark.objects.update_or_create(
            course_id=course_id,
            student_id=student_id,
            defaults={
                'assignment_score': data.get('assignment_score'),
                'midterm_score': data.get('midterm_score'),
                'final_score': data.get('final_score')
            }
        )

        return Response(CourseMarkSerializer(mark).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_save(self, request):
        bulk_data = request.data.get('marks', [])

        if not isinstance(bulk_data, list):
            return Response({'detail': 'Marks should be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        for entry in bulk_data:
            course_id = entry.get('course_id')
            student_id = entry.get('student_id')

            if not course_id or not student_id:
                continue

            try:
                course = ExternalCourse.objects.get(id=course_id, professor_email=request.user.email)
            except ExternalCourse.DoesNotExist:
                continue

            ExternalCourseMark.objects.update_or_create(
                course_id=course_id,
                student_id=student_id,
                defaults={
                    'assignment_score': entry.get('assignment_score', 0),
                    'midterm_score': entry.get('midterm_score', 0),
                    'final_score': entry.get('final_score', 0)
                }
            )

        return Response({'detail': 'Marks updated successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export')
    def export_csv(self, request):
        marks = ExternalCourseMark.objects.filter(course__professor_email=request.user.email)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="marks_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['Student Email', 'Course Code', 'Assignment Score', 'Midterm Score', 'Final Exam Score'])

        for mark in marks:
            writer.writerow([
                mark.student.user_email,
                mark.course.code,
                mark.assignment_score,
                mark.midterm_score,
                mark.final_score
            ])

        return response
    
class AnnouncementViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        user_email = self.request.user.email
        professor = Professor.objects.filter(user_email=user_email).first()

        if not professor:
            return ExternalAnnouncement.objects.none()

        department = ExternalDepartment.objects.filter(id=professor.department).first()
        if not department:
            return ExternalAnnouncement.objects.none()

        college = ExternalCollege.objects.filter(id=department.college_id).first()

        return ExternalAnnouncement.objects.filter(
            Q(target_type='all_users') |
            Q(target_type='professors') |
            Q(target_type='department', target_id=department.id) |
            Q(target_type='college', target_id=college.id if college else None)
        ).order_by('-created_at')
