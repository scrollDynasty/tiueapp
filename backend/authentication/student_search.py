import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .ldap_service import ldap_service

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def search_students(request):
    """
    Поиск студентов через LDAP
    
    Query parameters:
    - q: поисковый запрос (имя, фамилия, username)
    - course: курс (1, 2, 3, 4)
    - group: группа (например, IT22-01)
    - limit: максимальное количество результатов (по умолчанию 50)
    """
    try:
        # Получаем параметры поиска
        query = request.GET.get('q', '')
        course = request.GET.get('course')
        group = request.GET.get('group')
        limit = int(request.GET.get('limit', 50))
        
        logger.info(f"Student search request: query='{query}', course={course}, group='{group}', limit={limit}")
        
        # Валидация параметров
        if not query and not course and not group:
            return Response({
                'success': False,
                'error': 'Необходимо указать хотя бы один параметр поиска'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Вызываем LDAP сервис для поиска студентов
        success, ldap_response = ldap_service.search_students(
            query=query if query else None,
            course=int(course) if course else None,
            group=group if group else None,
            limit=limit
        )
        
        if success:
            students = ldap_response.get('students', [])
            
            # Обогащаем данные студентов аватарками из локальной БД
            for student in students:
                username = student.get('uid', '')
                if username:
                    try:
                        # Пытаемся найти пользователя в локальной БД для получения аватарки
                        from users.models import CustomUser
                        local_user = CustomUser.objects.filter(username=username).first()
                        if local_user and local_user.avatar:
                            from django.conf import settings
                            student['avatar'] = f"{settings.BASE_URL}{local_user.avatar.url}"
                    except Exception as e:
                        logger.warning(f"Failed to get avatar for user {username}: {e}")
            
            logger.info(f"LDAP student search successful: found {len(students)} students")
            return Response({
                'success': True,
                'data': students
            }, status=status.HTTP_200_OK)
        else:
            logger.warning("LDAP student search failed")
            error_message = ldap_response.get('error', 'Не удалось найти студентов')
            
            # Определяем статус ответа на основе типа ошибки
            if 'timeout' in error_message.lower() or 'connection' in error_message.lower():
                response_status = status.HTTP_503_SERVICE_UNAVAILABLE
            else:
                response_status = status.HTTP_400_BAD_REQUEST
                
            return Response({
                'success': False,
                'error': error_message
            }, status=response_status)
            
    except ValueError as e:
        logger.error(f"Invalid parameter in student search: {e}")
        return Response({
            'success': False,
            'error': 'Неверные параметры запроса'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Student search error: {e}")
        return Response({
            'success': False,
            'error': 'Внутренняя ошибка сервера'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
