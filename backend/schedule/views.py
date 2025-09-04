from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Schedule

class ScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [IsAuthenticated]

class ScheduleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [IsAuthenticated]
