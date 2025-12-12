from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import News, Event, EventRegistration
from .serializers import NewsSerializer, EventSerializer, EventRegistrationSerializer

class IsAdminOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):

        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = News.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset

    def create(self, request, *args, **kwargs):

        print(f"NewsViewSet.create called")
        print(f"Request data: {request.data}")
        print(f"Request files: {request.FILES}")

        data = request.data.copy()

        if 'image' in data and not request.FILES.get('image'):
            image_value = data.get('image')
            print(f"Image value type: {type(image_value)}, value: {image_value}")

            if isinstance(image_value, str) and (image_value == '[object Object]' or not image_value.startswith('data:')):
                print("Removing invalid image field")
                data.pop('image', None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def create(self, request, *args, **kwargs):

        print(f"EventViewSet.create called")
        print(f"Request data: {request.data}")
        print(f"Request files: {request.FILES}")
        print(f"Content-Type: {request.content_type}")

        data = request.data.copy()

        if 'image' in data and not request.FILES.get('image'):
            image_value = data.get('image')
            print(f"Image value type: {type(image_value)}, value: {image_value}")

            if isinstance(image_value, str) and (image_value == '[object Object]' or not image_value.startswith('data:')):
                print("Removing invalid image field")
                data.pop('image', None)

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        queryset = Event.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):

        event = self.get_object()

        if EventRegistration.objects.filter(user=request.user, event=event).exists():
            return Response(
                {'detail': 'Вы уже зарегистрированы на это событие.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if event.max_participants and event.current_participants >= event.max_participants:
            return Response(
                {'detail': 'Достигнуто максимальное количество участников.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        registration = EventRegistration.objects.create(user=request.user, event=event)

        event.current_participants += 1
        event.save()

        serializer = EventRegistrationSerializer(registration, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, pk=None):

        event = self.get_object()

        try:
            registration = EventRegistration.objects.get(user=request.user, event=event)
            registration.delete()

            if event.current_participants > 0:
                event.current_participants -= 1
                event.save()

            return Response(
                {'detail': 'Регистрация отменена.'},
                status=status.HTTP_200_OK
            )
        except EventRegistration.DoesNotExist:
            return Response(
                {'detail': 'Вы не зарегистрированы на это событие.'},
                status=status.HTTP_404_NOT_FOUND
            )
