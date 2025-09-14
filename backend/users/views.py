from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CustomUser
from .serializers import CustomUserSerializer
import logging

logger = logging.getLogger(__name__)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        username = getattr(request.user, "username", str(request.user))
        sanitized_username = str(username).replace('\n', '').replace('\r', '')
        logger.info(f"User list requested by: {sanitized_username}")
        queryset = self.get_queryset()
        logger.info(f"Found {queryset.count()} users in database")
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Serialized data: {serializer.data}")
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        logger.info(f"User creation requested by: {request.user}")
        logger.info(f"Request data: {request.data}")
        response = super().create(request, *args, **kwargs)
        logger.info(f"User created successfully: {response.data}")
        return response

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
