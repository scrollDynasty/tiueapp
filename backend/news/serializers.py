from rest_framework import serializers
from datetime import datetime
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
    image_base64 = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = News
        fields = [
            'id', 'title', 'subtitle', 'content', 'author', 'author_name',
            'category', 'icon', 'is_important', 'image', 'image_base64', 'events', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'author_name', 'date', 'events']
    
    def create(self, validated_data):
        # Обработка base64 изображения
        image_base64 = validated_data.pop('image_base64', None)
        if image_base64:
            try:
                # Извлекаем данные изображения из base64 строки
                if 'data:' in image_base64:
                    header, image_data = image_base64.split(',', 1)
                    # Извлекаем тип файла из заголовка
                    file_ext = header.split('/')[1].split(';')[0]
                else:
                    image_data = image_base64
                    file_ext = 'jpg'  # по умолчанию
                
                # Декодируем base64
                image_binary = base64.b64decode(image_data)
                image_file = ContentFile(image_binary, name=f'news_image.{file_ext}')
                validated_data['image'] = image_file
                
                print(f"Successfully converted base64 to image file: {file_ext}")
            except Exception as e:
                print(f"Error processing base64 image: {e}")
                # Продолжаем без изображения, если произошла ошибка
                pass
        
        # Автоматически устанавливаем автора как текущего пользователя
        validated_data['author'] = self.context['request'].user
        print(f"Creating news with data: {validated_data}")
        print(f"Image in validated_data: {validated_data.get('image', 'No image')}")
        return super().create(validated_data)


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_registered = serializers.SerializerMethodField()
    date = serializers.CharField()  # Принимаем дату как строку для кастомной обработки
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 'time',
            'category', 'max_participants', 'current_participants', 'image',
            'news', 'created_by', 'created_by_name', 'is_registered', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'current_participants', 'created_at', 'updated_at', 'created_by_name', 'is_registered']
    
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
