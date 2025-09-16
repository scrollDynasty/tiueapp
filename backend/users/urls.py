from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListCreateView.as_view(), name='user-list-create'),
    path('<int:pk>/', views.UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
]
