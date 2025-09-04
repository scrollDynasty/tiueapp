from django.urls import path
from . import views

urlpatterns = [
    path('', views.ScheduleListCreateView.as_view(), name='schedule-list-create'),
    path('<int:pk>/', views.ScheduleRetrieveUpdateDestroyView.as_view(), name='schedule-detail'),
]
