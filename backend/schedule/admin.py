from django.contrib import admin
from .models import Schedule

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('subject', 'teacher', 'group', 'day', 'time', 'room', 'lesson_type')
    list_filter = ('day', 'lesson_type', 'group', 'teacher')
    search_fields = ('subject', 'teacher__user__first_name', 'teacher__user__last_name', 'group__name')
    ordering = ('day', 'time')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('teacher__user', 'group')
