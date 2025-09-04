from django.db import models

class Schedule(models.Model):
    LESSON_TYPES = (
        ('lecture', 'Лекция'),
        ('practice', 'Практика'),
        ('lab', 'Лабораторная'),
        ('seminar', 'Семинар'),
    )
    
    DAYS_OF_WEEK = (
        ('Понедельник', 'Понедельник'),
        ('Вторник', 'Вторник'),
        ('Среда', 'Среда'),
        ('Четверг', 'Четверг'),
        ('Пятница', 'Пятница'),
        ('Суббота', 'Суббота'),
    )
    
    subject = models.CharField(max_length=200)
    teacher = models.ForeignKey('users.Professor', on_delete=models.CASCADE)
    group = models.ForeignKey('groups.Group', on_delete=models.CASCADE, related_name='schedule_items')
    room = models.CharField(max_length=20)
    building = models.CharField(max_length=100)
    time = models.CharField(max_length=20)  # например "09:00-10:30"
    day = models.CharField(max_length=20, choices=DAYS_OF_WEEK)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPES)
    color = models.CharField(max_length=7, default='#6366f1')  # hex color
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.subject} - {self.group.name} ({self.day} {self.time})"
    
    class Meta:
        ordering = ['day', 'time']
