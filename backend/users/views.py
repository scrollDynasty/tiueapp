from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from datetime import datetime, timedelta
from .models import CustomUser, Student, Grade, Attendance
from .serializers import CustomUserSerializer
from news.models import News, Event
from schedule.models import Schedule
import logging

logger = logging.getLogger(__name__)

class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        username = getattr(request.user, "username", str(request.user))
        sanitized_username = str(username).replace('\n', '').replace('\r', '')
        logger.info(f"User list requested by: {sanitized_username}")
        queryset = self.get_queryset()
        logger.info(f"Found {queryset.count()} users in database")
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Serialized data: {serializer.data}")
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        logger.info(f"User creation requested by: {request.user}")
        logger.info(f"Request data: {request.data}")
        response = super().create(request, *args, **kwargs)
        logger.info(f"User created successfully: {response.data}")
        return response

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    Dashboard API endpoint - возвращает данные для главной страницы
    """
    try:
        user = request.user
        
        # Получаем профиль студента если пользователь студент
        student_profile = None
        if user.role == 'student':
            try:
                student_profile = Student.objects.get(user=user)
            except Student.DoesNotExist:
                pass
        
        # 1. Новости (последние 5)
        news_data = []
        recent_news = News.objects.filter(is_important=True)[:3]  # Важные новости
        for news in recent_news:
            news_data.append({
                "id": news.id,
                "title": news.title,
                "description": news.subtitle or news.content[:100] + "...",
                "image": request.build_absolute_uri(news.image.url) if news.image else None,
                "date": news.created_at.strftime("%Y-%m-%d")
            })
        
        # 2. События (ближайшие 5)
        events_data = []
        upcoming_events = Event.objects.filter(
            date__gte=datetime.now().date()
        ).order_by('date', 'time')[:5]
        
        for event in upcoming_events:
            events_data.append({
                "id": event.id,
                "title": event.title,
                "date": event.date.strftime("%Y-%m-%d"),
                "image": request.build_absolute_uri(event.image.url) if event.image else None
            })
        
        # 3. Курсы (для студента - его курсы, для других - общая статистика)
        courses_data = []
        if student_profile:
            # Получаем расписание студента (его группа)
            student_courses = Schedule.objects.filter(group=student_profile.group)
            
            for course in student_courses:
                # Считаем прогресс как среднюю оценку за курс
                grades = Grade.objects.filter(
                    student=student_profile, 
                    schedule=course
                )
                if grades.exists():
                    avg_grade = grades.aggregate(avg=Avg('grade_value'))['avg'] or 0
                    progress = min(avg_grade / 100, 1.0)  # от 0 до 1
                else:
                    progress = 0.0
                
                courses_data.append({
                    "id": course.id,
                    "name": course.subject,
                    "progress": round(progress, 2)
                })
        else:
            # Для преподавателей и админов - общие курсы
            all_courses = Schedule.objects.all()[:5]
            for course in all_courses:
                courses_data.append({
                    "id": course.id,
                    "name": course.subject,
                    "progress": 0.75  # примерный прогресс
                })
        
        # 4. GPA (средний балл)
        gpa = 0.0
        if student_profile:
            # Используем GPA из профиля студента или вычисляем
            if student_profile.gpa > 0:
                gpa = float(student_profile.gpa)
            else:
                # Вычисляем GPA на основе оценок
                grades = Grade.objects.filter(student=student_profile)
                if grades.exists():
                    total_percentage = sum(grade.grade_percentage for grade in grades)
                    avg_percentage = total_percentage / grades.count()
                    # Конвертируем в 4.0 шкалу
                    if avg_percentage >= 90:
                        gpa = 4.0
                    elif avg_percentage >= 80:
                        gpa = 3.0
                    elif avg_percentage >= 70:
                        gpa = 2.0
                    elif avg_percentage >= 60:
                        gpa = 1.0
                    else:
                        gpa = 0.0
        else:
            # Для не-студентов
            if user.role == 'professor':
                gpa = 4.5  # высокий рейтинг преподавателя
            elif user.role == 'admin':
                gpa = 4.8  # максимальный для админа
        
        # 5. Посещаемость (%)
        attendance_percentage = 85  # по умолчанию
        if student_profile:
            # Вычисляем реальную посещаемость
            attendance_records = Attendance.objects.filter(student=student_profile)
            if attendance_records.exists():
                present_count = attendance_records.filter(
                    status__in=['present', 'late']
                ).count()
                attendance_percentage = round(
                    (present_count / attendance_records.count()) * 100, 1
                )
        
        # Формируем ответ в требуемом формате
        dashboard_data = {
            "news": news_data,
            "events": events_data,
            "courses": courses_data,
            "gpa": round(gpa, 1),
            "attendance": attendance_percentage
        }
        
        logger.info(f"Dashboard data generated for user: {user.username}")
        return Response(dashboard_data)
        
    except Exception as e:
        logger.error(f"Dashboard error for user {request.user}: {str(e)}")
        # Возвращаем пустые данные в случае ошибки
        return Response({
            "news": [],
            "events": [],
            "courses": [],
            "gpa": 0.0,
            "attendance": 0
        })
