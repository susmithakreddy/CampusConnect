from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet,
    CourseViewSet,
    EnrollmentViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    AttendanceViewSet,
    CourseMarkViewSet,
    AnnouncementViewSet
)

router = DefaultRouter()
router.register(r'profile', StudentViewSet, basename='student-profile')
router.register(r'courses', CourseViewSet, basename='courses')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'assignments', AssignmentViewSet, basename='assignments')
router.register(r'submissions', SubmissionViewSet, basename='submissions')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'marks', CourseMarkViewSet, basename='marks')
router.register(r'announcements', AnnouncementViewSet, basename='announcements')

urlpatterns = router.urls
