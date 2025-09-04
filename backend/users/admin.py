from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Student, Professor, Admin

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('role', 'avatar', 'created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'faculty', 'course', 'group', 'gpa')
    list_filter = ('faculty', 'course', 'group')
    search_fields = ('user__first_name', 'user__last_name', 'student_id')
    ordering = ('user__last_name', 'user__first_name')

@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'title')
    list_filter = ('department',)
    search_fields = ('user__first_name', 'user__last_name', 'employee_id')
    ordering = ('user__last_name', 'user__first_name')

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__first_name', 'user__last_name')
