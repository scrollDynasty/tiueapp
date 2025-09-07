from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import News, Event, EventRegistration
from .serializers import NewsSerializer, EventSerializer, EventRegistrationSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешение, которое позволяет только администраторам создавать, редактировать и удалять.
    Все остальные могут только читать.
    """
    def has_permission(self, request, view):
        # Для методов чтения (GET, HEAD, OPTIONS) разрешаем всем
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # Для методов записи требуем аутентификацию и роль админа
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
        """Создание новости с дополнительным логированием"""
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category=category)
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        """Регистрация пользователя на событие"""
        event = self.get_object()
        
        # Проверяем, не зарегистрирован ли уже пользователь
        if EventRegistration.objects.filter(user=request.user, event=event).exists():
            return Response(
                {'detail': 'Вы уже зарегистрированы на это событие.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем, не превышен ли лимит участников
        if event.max_participants and event.current_participants >= event.max_participants:
            return Response(
                {'detail': 'Достигнуто максимальное количество участников.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем регистрацию
        registration = EventRegistration.objects.create(user=request.user, event=event)
        
        # Увеличиваем счетчик участников
        event.current_participants += 1
        event.save()
        
        serializer = EventRegistrationSerializer(registration, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unregister(self, request, pk=None):
        """Отмена регистрации пользователя на событие"""
        event = self.get_object()
        
        try:
            registration = EventRegistration.objects.get(user=request.user, event=event)
            registration.delete()
            
            # Уменьшаем счетчик участников
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
