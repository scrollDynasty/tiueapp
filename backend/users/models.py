from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

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


class Grade(models.Model):
    """Модель оценки (использует Schedule как источник курсов)"""
    GRADE_TYPES = [
        ('exam', 'Экзамен'),
        ('test', 'Контрольная'),
        ('homework', 'Домашнее задание'),
        ('project', 'Проект'),
        ('quiz', 'Тест'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Студент')
    schedule = models.ForeignKey('schedule.Schedule', on_delete=models.CASCADE, verbose_name='Предмет')
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPES, verbose_name='Тип оценки')
    
    grade_value = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Оценка'
    )
    max_grade = models.DecimalField(max_digits=5, decimal_places=2, default=100, verbose_name='Максимальная оценка')
    
    assignment_name = models.CharField(max_length=200, verbose_name='Название задания')
    date_graded = models.DateTimeField(auto_now_add=True, verbose_name='Дата выставления оценки')
    
    # Для AD интеграции в будущем
    external_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'
        ordering = ['-date_graded']
    
    def __str__(self):
        return f"{self.student} - {self.schedule.subject} - {self.grade_value}/{self.max_grade}"
    
    @property
    def grade_percentage(self):
        """Возвращает оценку в процентах"""
        return (self.grade_value / self.max_grade) * 100


class Attendance(models.Model):
    """Модель посещаемости"""
    ATTENDANCE_STATUS = [
        ('present', 'Присутствовал'),
        ('absent', 'Отсутствовал'),
        ('late', 'Опоздал'),
        ('excused', 'Уважительная причина'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='Студент')
    schedule = models.ForeignKey('schedule.Schedule', on_delete=models.CASCADE, verbose_name='Предмет')
    date = models.DateField(verbose_name='Дата')
    status = models.CharField(max_length=20, choices=ATTENDANCE_STATUS, verbose_name='Статус')
    
    notes = models.TextField(blank=True, verbose_name='Примечания')
    
    # Для AD интеграции в будущем
    external_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Посещаемость'
        verbose_name_plural = 'Посещаемость'
        unique_together = ('student', 'schedule', 'date')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student} - {self.schedule.subject} - {self.date} ({self.get_status_display()})"
