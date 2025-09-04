from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Студент'),
        ('professor', 'Преподаватель'),
        ('admin', 'Администратор'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    student_id = models.CharField(max_length=20, unique=True)
    faculty = models.CharField(max_length=100)
    course = models.IntegerField()
    group = models.ForeignKey('groups.Group', on_delete=models.CASCADE, related_name='students', null=True, blank=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"

class Professor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100, blank=True)  # должность
    subjects = models.JSONField(default=list)  # список предметов
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.department}"

class Admin(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    permissions = models.JSONField(default=list)  # список разрешений
    
    def __str__(self):
        return f"Администратор: {self.user.get_full_name()}"
