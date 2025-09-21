from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Делаем собственную проверку аутентификации
def upload_avatar(request):
    """
    Загрузка аватара пользователя
    
    Body: FormData с полем 'avatar' (изображение)
    
    Response:
    {
        "success": true,
        "data": {
            "avatar_url": "https://mobile.tiue.uz/media/avatars/avatar_123456.jpg"
        }
    }
    """
    # Отладочная информация
    logger.info(f"Request FILES keys: {list(request.FILES.keys())}")
    logger.info(f"Request POST keys: {list(request.POST.keys())}")
    logger.info(f"Request content type: {request.content_type}")
    
    # Получаем файл из FormData
    if 'avatar' not in request.FILES:
        available_files = list(request.FILES.keys())
        logger.warning(f"Avatar file not found. Available files: {available_files}")
        
        # Пробуем найти файл с другими именами
        if available_files:
            avatar_file = request.FILES[available_files[0]]
            logger.info(f"Using file with key: {available_files[0]}")
        else:
            logger.error("No files found in request.FILES")
            return Response({
                'success': False,
                'error': 'Файл аватара не найден'
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        avatar_file = request.FILES['avatar']
        logger.info("Avatar file found successfully")
    
    # Проверяем размер файла (максимум 5MB)
    if avatar_file.size > 5 * 1024 * 1024:
        return Response({
            'success': False,
            'error': 'Размер файла не должен превышать 5MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Проверяем тип файла
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if hasattr(avatar_file, 'content_type') and avatar_file.content_type:
        if avatar_file.content_type not in allowed_types:
            return Response({
                'success': False,
                'error': 'Поддерживаются только изображения (JPEG, PNG, WebP)'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    logger.info(f"Avatar file received: {avatar_file.name}, size: {avatar_file.size} bytes")
    
    try:
        # Гибридная аутентификация для аватаров
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            # LDAP пользователь - создаем/находим локальную запись
            ldap_token = auth_header.split(' ')[1]
            
            # Получаем профиль из LDAP
            from authentication.ldap_service import ldap_service
            success, profile_data = ldap_service.get_user_profile(ldap_token)
            
            if not success:
                return Response({
                    'success': False,
                    'error': 'Неверный LDAP токен'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Извлекаем username из email или используем uid
            username = profile_data.get('email', '').split('@')[0] if profile_data.get('email') else profile_data.get('uid', 'unknown')
            email = profile_data.get('email', f'{username}@tiue.uz')
            full_name = profile_data.get('full_name', '')
            
            # Создаем или получаем локального пользователя
            user, created = CustomUser.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': full_name.split()[1] if full_name.split() and len(full_name.split()) > 1 else 'Student',
                    'last_name': full_name.split()[0] if full_name.split() else '',
                    'role': 'student',
                    'is_active': True
                }
            )
            
            logger.info(f"Using LDAP user {username} (created: {created})")
            
        elif auth_header.startswith('Token '):
            # Локальный пользователь (администратор)
            if request.user.is_authenticated:
                user = request.user
                logger.info(f"Using local user {user.username}")
            else:
                return Response({
                    'success': False,
                    'error': 'Локальный пользователь не аутентифицирован'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                'success': False,
                'error': 'Требуется токен авторизации (Bearer или Token)'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Удаляем старый аватар если есть
        if user.avatar:
            import os
            try:
                old_avatar_path = user.avatar.path
                if os.path.exists(old_avatar_path):
                    os.remove(old_avatar_path)
                    logger.info(f"Old avatar deleted: {old_avatar_path}")
                else:
                    logger.warning(f"Old avatar file not found: {old_avatar_path}")
            except Exception as e:
                logger.error(f"Error deleting old avatar: {e}")
                # Продолжаем работу даже если не удалось удалить старый файл
        
        # Генерируем уникальное имя файла
        import uuid
        file_extension = avatar_file.name.split('.')[-1] if '.' in avatar_file.name else 'jpg'
        filename = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Сохраняем новый аватар
        user.avatar.save(filename, avatar_file, save=True)
        
        # Формируем полный URL
        from django.conf import settings
        base_url = getattr(settings, 'BASE_URL', 'http://localhost:4343')
        avatar_url = f"{base_url.rstrip('/')}{user.avatar.url}"
        
        logger.info(f"Avatar uploaded for user {user.username}: {avatar_url}")
        
        return Response({
            'success': True,
            'data': {
                'avatar_url': avatar_url
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Avatar upload error: {e}")
        return Response({
            'success': False,
            'error': 'Ошибка сохранения аватара'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_avatar(request, username):
    """
    Получение аватара пользователя по username
    
    URL: /api/users/avatar/<username>/
    
    Response:
    {
        "success": true,
        "data": {
            "avatar_url": "https://mobile.tiue.uz/media/avatars/avatar_123.jpg",
            "username": "U12345",
            "initials": "AB"
        }
    }
    """
    try:
        user = CustomUser.objects.filter(username=username).first()
        
        if not user:
            # Пользователь не найден в локальной базе - возвращаем инициалы
            initials = username[:2].upper() if username else 'ST'
            return Response({
                'success': True,
                'data': {
                    'avatar_url': None,
                    'username': username,
                    'initials': initials
                }
            }, status=status.HTTP_200_OK)
        
        # Формируем URL аватара
        avatar_url = None
        if user.avatar:
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:4343')
            avatar_url = f"{base_url.rstrip('/')}{user.avatar.url}"
        
        # Получаем инициалы
        if user.first_name and user.last_name:
            initials = f"{user.first_name[0]}{user.last_name[0]}".upper()
        elif user.first_name:
            initials = user.first_name[0].upper()
        else:
            initials = user.username[:2].upper()
        
        return Response({
            'success': True,
            'data': {
                'avatar_url': avatar_url,
                'username': user.username,
                'initials': initials,
                'full_name': f"{user.first_name} {user.last_name}".strip()
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Get avatar error: {e}")
        return Response({
            'success': False,
            'error': 'Ошибка получения аватара'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
