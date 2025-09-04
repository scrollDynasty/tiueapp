from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test_api, name='test'),
    path('login/', views.login, name='login'),
    path('login', views.login, name='login-no-slash'),  # Добавляем без слеша
    path('logout/', views.logout, name='logout'),
    path('logout', views.logout, name='logout-no-slash'),
    path('me/', views.current_user, name='current_user'),
    path('me', views.current_user, name='current_user-no-slash'),
]
