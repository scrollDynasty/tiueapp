from django.urls import path
from . import views

urlpatterns = [
    path('', views.GroupListCreateView.as_view(), name='group-list-create'),
    path('<int:pk>/', views.GroupRetrieveUpdateDestroyView.as_view(), name='group-detail'),
]
