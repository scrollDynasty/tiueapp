from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Group

class GroupSerializer:

    pass

class GroupListCreateView(generics.ListCreateAPIView):
    queryset = Group.objects.all()
    permission_classes = [IsAuthenticated]

class GroupRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    permission_classes = [IsAuthenticated]
