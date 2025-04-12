from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from .permissions import IsAdmin
from .models import (
    ExternalUser,
    ExternalCollege,
    ExternalDepartment,
    ExternalProgram,
    ExternalStudent,
    ExternalProfessor,
    ExternalCourse,
    AdminAnnouncement,
    SystemSetting,
    ActivityLog
)
from .serializers import (
    ExternalUserSerializer,
    ExternalCollegeSerializer,
    ExternalDepartmentSerializer,
    ExternalProgramSerializer,
    ExternalStudentSerializer,
    ExternalProfessorSerializer,
    ExternalCourseSerializer,
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    CollegeSerializer,
    DepartmentSerializer,
    ProgramSerializer,
    CourseSerializer,
    AdminAnnouncementSerializer,
    SystemSettingSerializer,
    ActivityLogSerializer
)

# ------------------- External Users Management -------------------
class ExternalUserViewSet(viewsets.ModelViewSet):
    queryset = ExternalUser.objects.all()
    serializer_class = ExternalUserSerializer

# ------------------- External Students Management -------------------
class ExternalStudentViewSet(viewsets.ModelViewSet):
    queryset = ExternalStudent.objects.all()
    serializer_class = ExternalStudentSerializer

# ------------------- External Professors Management -------------------
class ExternalProfessorViewSet(viewsets.ModelViewSet):
    queryset = ExternalProfessor.objects.all()
    serializer_class = ExternalProfessorSerializer

# ------------------- Admin - User Management -------------------
@api_view(['GET'])
@permission_classes([IsAdmin])
def dashboard_data(request):
    students_count = ExternalUser.objects.filter(role='student').count()
    professors_count = ExternalUser.objects.filter(role='professor').count()
    admins_count = ExternalUser.objects.filter(role='admin').count()
    active_users_count = ExternalUser.objects.filter(is_active=True).count()

    colleges_count = ExternalCollege.objects.count()
    departments_count = ExternalDepartment.objects.count()
    programs_count = ExternalProgram.objects.count()
    courses_count = ExternalCourse.objects.count()

    # System Settings
    site_name = SystemSetting.objects.filter(key='site_name').first()
    two_fa_setting = SystemSetting.objects.filter(key='2fa_enabled').first()

    # Activities
    recent_activities = ActivityLog.objects.order_by('-timestamp')[:5]
    activity_data = [
        {
            "admin_email": activity.admin_email,
            "action_type": activity.action_type,
            "target_model": activity.target_model,
            "description": activity.description,
            "timestamp": activity.timestamp
        }
        for activity in recent_activities
    ]

    return Response({
        "students_count": students_count,
        "professors_count": professors_count,
        "admins_count": admins_count,
        "active_users_count": active_users_count,
        "colleges_count": colleges_count,
        "departments_count": departments_count,
        "programs_count": programs_count,
        "courses_count": courses_count,
        "site_name": site_name.value if site_name else "CampusConnect",
        "2fa_enabled": two_fa_setting.value.lower() == "true" if two_fa_setting else True,
        "recent_activities": activity_data
    })

# ------------------- Admin - User Management -------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = ExternalUser.objects.all()
    permission_classes = [ IsAdmin]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer
        return UserListSerializer

    def get_queryset(self):
        return ExternalUser.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='User',
            target_object_id=user.id,
            description=f"Created user {user.email} with role {user.role}"
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='User',
            target_object_id=user.id,
            description=f"Updated user {user.email}"
        )
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()

        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='deactivate',
            target_model='User',
            target_object_id=instance.id,
            description=f"Deactivated user {instance.email}"
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- Colleges -------------------
class CollegeViewSet(viewsets.ModelViewSet):
    queryset = ExternalCollege.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [ IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def perform_create(self, serializer):
        college = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='College',
            target_object_id=college.id,
            description=f"Created College: {college.name}"
        )

    def perform_update(self, serializer):
        college = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='College',
            target_object_id=college.id,
            description=f"Updated College: {college.name}"
        )

    def perform_destroy(self, instance):
        try:
            instance.delete()
            ActivityLog.objects.create(
                admin_email=self.request.user.email,
                action_type='delete',
                target_model='College',
                target_object_id=instance.id,
                description=f"Deleted College: {instance.name}"
            )
        except IntegrityError:
            raise ValidationError({"detail": "Cannot delete College because Departments are linked to it."})

# ------------------- Departments -------------------
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = ExternalDepartment.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['college_id']

    def perform_create(self, serializer):
        department = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='Department',
            target_object_id=department.id,
            description=f"Created Department: {department.name}"
        )

    def perform_update(self, serializer):
        department = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='Department',
            target_object_id=department.id,
            description=f"Updated Department: {department.name}"
        )

    def perform_destroy(self, instance):
        try: 
            instance.delete()
            ActivityLog.objects.create(
                admin_email=self.request.user.email,
                action_type='delete',
                target_model='Department',
                target_object_id=instance.id,
                description=f"Deleted Department: {instance.name}"
            )
        except IntegrityError:
            raise ValidationError({"detail": "Cannot delete Department because Programs are linked to it."})    

# ------------------- Programs -------------------
class ProgramViewSet(viewsets.ModelViewSet):
    queryset = ExternalProgram.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [ IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['department_id', 'program_type']

    def perform_create(self, serializer):
        program = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='Program',
            target_object_id=program.id,
            description=f"Created Program: {program.name}"
        )

    def perform_update(self, serializer):
        program = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='Program',
            target_object_id=program.id,
            description=f"Updated Program: {program.name}"
        )

    def perform_destroy(self, instance):
        try:
            instance.delete()
            ActivityLog.objects.create(
                admin_email=self.request.user.email,
                action_type='delete',
                target_model='Program',
                target_object_id=instance.id,
                description=f"Deleted Program: {instance.name}"
            )
        except IntegrityError:
            raise ValidationError({"detail": "Cannot delete Program because Courses are linked to it."})

# ------------------- Courses -------------------
class CourseViewSet(viewsets.ModelViewSet):
    queryset = ExternalCourse.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [ IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name']
    ordering_fields = ['program_id', 'professor_email', 'year', 'semester']

    def perform_create(self, serializer):
        course = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='Course',
            target_object_id=course.id,
            description=f"Created Course: {course.name}"
        )

    def perform_update(self, serializer):
        course = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='Course',
            target_object_id=course.id,
            description=f"Updated Course: {course.name}"
        )

    def perform_destroy(self, instance):
        instance.delete()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='delete',
            target_model='Course',
            target_object_id=instance.id,
            description=f"Deleted Course: {instance.name}"
        )

# ------------------- Announcements -------------------
class AdminAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = AdminAnnouncement.objects.all().order_by('-created_at')
    serializer_class = AdminAnnouncementSerializer
    permission_classes = [ IsAdmin]

    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user.email)
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='create',
            target_model='AdminAnnouncement',
            target_object_id=announcement.id,
            description=f"Created Announcement: {announcement.title}"
        )

    def perform_update(self, serializer):
        announcement = serializer.save()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='update',
            target_model='AdminAnnouncement',
            target_object_id=announcement.id,
            description=f"Updated Announcement: {announcement.title}"
        )

    def perform_destroy(self, instance):
        instance.delete()
        ActivityLog.objects.create(
            admin_email=self.request.user.email,
            action_type='delete',
            target_model='AdminAnnouncement',
            target_object_id=instance.id,
            description=f"Deleted Announcement: {instance.title}"
        )

# ------------------- System Settings -------------------
class SystemSettingViewSet(viewsets.ModelViewSet):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [ IsAdmin]
    
    def perform_update(self, serializer):
        try:
            print("Incoming PATCH data:", self.request.data)
            instance = serializer.save()

            if instance.key == '2fa_enabled':
                value = str(instance.value).lower()
                enable = value == 'true'
                from .models import ExternalUser
                ExternalUser.objects.all().update(is_2fa_enabled=int(enable)) 

            ActivityLog.objects.create(
                admin_email=self.request.user.email,
                action_type='system_setting_change',
                target_model='SystemSetting',
                target_object_id=instance.id,
                description=f"Changed system setting {instance.key} to {instance.value}"
            )
        except ValidationError as e:
            print("Validation Error Data:", e.detail)
            raise e

# ------------------- Activity Logs -------------------
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = [ IsAdmin]
