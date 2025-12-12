

from django.urls import path
from . import views
from .student_search import search_students

urlpatterns = [

    path('test/', views.test_api, name='ldap_test'),

    path('login/', views.ldap_login, name='ldap_login'),
    path('login', views.ldap_login, name='ldap_login_no_slash'),

    path('refresh/', views.ldap_refresh_token, name='ldap_refresh'),
    path('refresh', views.ldap_refresh_token, name='ldap_refresh_no_slash'),

    path('profile/', views.ldap_get_user_profile, name='ldap_profile'),
    path('profile', views.ldap_get_user_profile, name='ldap_profile_no_slash'),
    path('me/', views.ldap_get_user_profile, name='ldap_me'),
    path('me', views.ldap_get_user_profile, name='ldap_me_no_slash'),

    path('courses/', views.ldap_get_active_courses, name='ldap_courses'),
    path('courses', views.ldap_get_active_courses, name='ldap_courses_no_slash'),

    path('grades/', views.ldap_get_course_grades, name='ldap_grades'),
    path('grades', views.ldap_get_course_grades, name='ldap_grades_no_slash'),

    path('attendance/', views.ldap_get_course_attendance, name='ldap_attendance'),
    path('attendance', views.ldap_get_course_attendance, name='ldap_attendance_no_slash'),

    path('messages/', views.ldap_get_messages, name='ldap_messages'),
    path('messages', views.ldap_get_messages, name='ldap_messages_no_slash'),

    path('upload/', views.ldap_upload_image, name='ldap_upload'),
    path('upload', views.ldap_upload_image, name='ldap_upload_no_slash'),

    path('logout/', views.test_api, name='ldap_logout'),
    path('logout', views.test_api, name='ldap_logout_no_slash'),

    path('search/students/', search_students, name='search_students'),
    path('search/students', search_students, name='search_students_no_slash'),
]
