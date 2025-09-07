from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class News(models.Model):
    CATEGORY_CHOICES = [
        ('announcement', 'Объявление'),
        ('academic', 'Учебные'),
        ('sports', 'Спорт'),
        ('culture', 'Культура'),
        ('other', 'Другое'),
    ]
    
    ICON_CHOICES = [
        ('megaphone-outline', 'Объявление'),
        ('school-outline', 'Учеба'),
        ('trophy-outline', 'Достижения'),
        ('people-outline', 'События'),
        ('calendar-outline', 'Календарь'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    subtitle = models.CharField(max_length=300, verbose_name='Подзаголовок')
    content = models.TextField(verbose_name='Содержание')
    image = models.ImageField(upload_to='news/', null=True, blank=True, verbose_name='Изображение')
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Автор')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='announcement', verbose_name='Категория')
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, default='megaphone-outline', verbose_name='Иконка')
    is_important = models.BooleanField(default=False, verbose_name='Важная новость')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Event(models.Model):
    CATEGORY_CHOICES = [
        ('university', 'Университетские'),
        ('academic', 'Учебные'),
        ('sports', 'Спортивные'),
        ('cultural', 'Культурные'),
        ('social', 'Социальные'),
        ('club', 'Клубные'),
        ('other', 'Другие'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    location = models.CharField(max_length=200, verbose_name='Место проведения')
    date = models.DateField(verbose_name='Дата')
    time = models.TimeField(verbose_name='Время')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='university', verbose_name='Категория')
    max_participants = models.PositiveIntegerField(null=True, blank=True, verbose_name='Максимум участников')
    current_participants = models.PositiveIntegerField(default=0, verbose_name='Текущее количество участников')
    image = models.ImageField(upload_to='events/', null=True, blank=True, verbose_name='Изображение')
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='events', verbose_name='Связанная новость', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Создано пользователем')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Событие'
        verbose_name_plural = 'События'
        ordering = ['date', 'time']
    
    def __str__(self):
        return f"{self.title} - {self.date}"


class EventRegistration(models.Model):
    """Модель для регистрации пользователей на события"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, verbose_name='Событие')
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации')
    
    class Meta:
        unique_together = ('user', 'event')
        verbose_name = 'Регистрация на событие'
        verbose_name_plural = 'Регистрации на события'
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
