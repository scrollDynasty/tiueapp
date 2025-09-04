from django.db import models

class Group(models.Model):
    name = models.CharField(max_length=50, unique=True)
    faculty = models.CharField(max_length=100)
    course = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.faculty}"
    
    class Meta:
        ordering = ['faculty', 'course', 'name']
