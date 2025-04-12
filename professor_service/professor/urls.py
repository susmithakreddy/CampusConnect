from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfessorViewSet,
    CourseViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    AttendanceViewSet,
    CourseMarkViewSet,
    AnnouncementViewSet
)

router = DefaultRouter()
router.register('profile', ProfessorViewSet, basename='professor')
router.register('courses', CourseViewSet, basename='professor-courses')
router.register('assignments', AssignmentViewSet, basename='professor-assignments')
router.register('submissions', SubmissionViewSet, basename='professor-submissions')
router.register('attendance', AttendanceViewSet, basename='professor-attendance')
router.register('marks', CourseMarkViewSet, basename='professor-marks')
router.register('announcements', AnnouncementViewSet, basename='professor-announcements')

urlpatterns = [
    path('', include(router.urls)),
]
