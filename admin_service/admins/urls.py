from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    CollegeViewSet,
    DepartmentViewSet,
    ProgramViewSet,
    ExternalStudentViewSet,
    ExternalProfessorViewSet,
    CourseViewSet,
    AdminAnnouncementViewSet,
    SystemSettingViewSet,
    ActivityLogViewSet,
    dashboard_data,
)

router = DefaultRouter()

router.register(r'users', UserViewSet)
router.register(r'announcements', AdminAnnouncementViewSet)
router.register(r'colleges', CollegeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'students', ExternalStudentViewSet)
router.register(r'professors', ExternalProfessorViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'system-settings', SystemSettingViewSet)
router.register(r'activity-logs', ActivityLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_data, name='dashboard-data'),
]
