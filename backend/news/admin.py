from django.contrib import admin
from .models import News, Event, EventRegistration


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'is_important', 'created_at']
    list_filter = ['category', 'is_important', 'created_at']
    search_fields = ['title', 'subtitle', 'content']
    list_editable = ['is_important']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'subtitle', 'content', 'author')
        }),
        ('Настройки', {
            'fields': ('category', 'icon', 'is_important')
        }),
        ('Служебная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'time', 'location', 'category', 'current_participants', 'max_participants', 'created_by']
    list_filter = ['category', 'date', 'created_at']
    search_fields = ['title', 'description', 'location']
    ordering = ['date', 'time']
    readonly_fields = ['created_at', 'updated_at', 'current_participants']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'description', 'location', 'date', 'time')
        }),
        ('Настройки', {
            'fields': ('category', 'max_participants', 'current_participants', 'image', 'created_by')
        }),
        ('Служебная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'registered_at']
    list_filter = ['event__category', 'registered_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'event__title']
    ordering = ['-registered_at']
    readonly_fields = ['registered_at']
