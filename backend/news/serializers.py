from rest_framework import serializers
from datetime import datetime
import time
import base64
import io
from django.core.files.base import ContentFile
from .models import News, Event, EventRegistration


class EventForNewsSerializer(serializers.ModelSerializer):
    """Упрощенный сериализатор событий для отображения в новостях"""
    class Meta:
        model = Event
        fields = ['id', 'title', 'date', 'time', 'location', 'category']


class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    date = serializers.DateTimeField(source='created_at', format='%Y-%m-%d %H:%M:%S', read_only=True)
    events = EventForNewsSerializer(many=True, read_only=True)
    # Используем стандартное поле для записи, но переопределяем to_representation для чтения
    
    class Meta:
        model = News
        fields = [
            'id', 'title', 'subtitle', 'content', 'author', 'author_name',
            'category', 'icon', 'is_important', 'image', 'events', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'author_name', 'date', 'events']
    
    def to_representation(self, instance):
        """Переопределяем представление для возврата полного URL изображения"""
        data = super().to_representation(instance)
        if instance.image:
            # Всегда используем BASE_URL из настроек (.env файла)
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            
            # Убираем лишний слеш если есть
            base_url = base_url.rstrip('/')
            image_url = instance.image.url
            if not image_url.startswith('/'):
                image_url = '/' + image_url
                
            full_url = f"{base_url}{image_url}"
            
            # Принудительно используем HTTPS для ngrok
            if 'ngrok' in full_url and full_url.startswith('http://'):
                full_url = full_url.replace('http://', 'https://', 1)
                
            data['image'] = full_url
            print(f"📸 [NEWS] Generated image URL: {full_url}")
        return data
    
    def create(self, validated_data):
        # Автоматически устанавливаем автора как текущего пользователя
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_registered = serializers.SerializerMethodField()
    date = serializers.CharField()  # Принимаем дату как строку для кастомной обработки
    # Используем стандартное поле для записи, но переопределяем to_representation для чтения
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 'time',
            'category', 'max_participants', 'current_participants', 'image',
            'news', 'created_by', 'created_by_name', 'is_registered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'current_participants', 'created_at', 'updated_at', 'created_by_name', 'is_registered']
    
    def to_representation(self, instance):
        """Переопределяем представление для возврата полного URL изображения"""
        data = super().to_representation(instance)
        if instance.image:
            # Всегда используем BASE_URL из настроек (.env файла)
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            
            # Убираем лишний слеш если есть
            base_url = base_url.rstrip('/')
            image_url = instance.image.url
            if not image_url.startswith('/'):
                image_url = '/' + image_url
                
            full_url = f"{base_url}{image_url}"
            
            # Принудительно используем HTTPS для ngrok
            if 'ngrok' in full_url and full_url.startswith('http://'):
                full_url = full_url.replace('http://', 'https://', 1)
                
            data['image'] = full_url
            print(f"📸 [EVENT] Generated image URL: {full_url}")
        return data
    
    
    def validate_date(self, value):
        """Конвертируем дату из формата DD.MM.YYYY в YYYY-MM-DD"""
        try:
            # Пытаемся парсить формат DD.MM.YYYY
            if '.' in value:
                date_obj = datetime.strptime(value, '%d.%m.%Y').date()
                return date_obj
            # Если уже в правильном формате
            elif '-' in value:
                date_obj = datetime.strptime(value, '%Y-%m-%d').date()
                return date_obj
            else:
                raise serializers.ValidationError("Неверный формат даты. Используйте DD.MM.YYYY или YYYY-MM-DD")
        except ValueError:
            raise serializers.ValidationError("Неверный формат даты. Используйте DD.MM.YYYY")
    
    def get_is_registered(self, obj):
        """Проверяем, зарегистрирован ли текущий пользователь на событие"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventRegistration.objects.filter(
                user=request.user, 
                event=obj
            ).exists()
        return False
    
    def create(self, validated_data):
        # Автоматически устанавливаем создателя как текущего пользователя
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class EventRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'user', 'event', 'event_title', 'user_name', 'registered_at']
        read_only_fields = ['id', 'registered_at', 'event_title', 'user_name']
    
    def create(self, validated_data):
        # Автоматически устанавливаем пользователя как текущего
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)