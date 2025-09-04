from django.contrib import admin
from .models import Group

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'faculty', 'course', 'student_count', 'created_at')
    list_filter = ('faculty', 'course')
    search_fields = ('name', 'faculty')
    ordering = ('faculty', 'course', 'name')
    
    def student_count(self, obj):
        return obj.students.count()
    student_count.short_description = 'Количество студентов'
