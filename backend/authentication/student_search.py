import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
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
    - group: группа/department (например, BM_01 EN Year1)
    - limit: максимальное количество результатов (по умолчанию 50)
    """
    try:
        # Получаем Bearer токен
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Bearer токен обязателен'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        access_token = auth_header.split(' ')[1]
        
        # Получаем параметры поиска
        query = request.GET.get('q', '')
        group = request.GET.get('group')
        limit = int(request.GET.get('limit', 50))
        
        # Валидация параметров
        if not query and not group:
            return Response({
                'success': False,
                'error': 'Необходимо указать хотя бы один параметр поиска'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Вызываем LDAP сервис для поиска студентов
        success, ldap_response = ldap_service.search_students(
            access_token,
            query=query if query else None,
            group=group if group else None,
            limit=limit
        )
        
        if success:
            students = ldap_response.get('students', [])
            
            # Обогащаем данные студентов аватарками - используем ТОТ ЖЕ метод что и в getCurrentUser
            for student in students:
                username = student.get('uid', '')
                if username:
                    try:
                        from users.models import CustomUser
                        
                        # Получаем пользователя из локальной БД
                        local_user = CustomUser.objects.filter(username=username).first()
                        
                        if local_user and local_user.avatar:
                            # Есть локально загруженная аватарка - формируем полный URL
                            base_url = getattr(settings, 'BASE_URL', 'https://mobile.tiue.uz')
                            avatar_url = f"{base_url.rstrip('/')}{local_user.avatar.url}"
                            student['avatar'] = avatar_url
                            logger.debug(f"Avatar for {username}: {avatar_url}")
                        else:
                            # Нет локальной аватарки - используем LDAP URL
                            ldap_base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')
                            avatar_url = f"{ldap_base_url}/mobile/img/{username}"
                            student['avatar'] = avatar_url
                            logger.debug(f"LDAP avatar for {username}: {avatar_url}")
                            
                    except Exception as e:
                        logger.error(f"Error getting avatar for {username}: {e}")
                        # При ошибке - null (покажем инициалы)
                        student['avatar'] = None 
            
            return Response({
                'success': True,
                'data': students
            }, status=status.HTTP_200_OK)
        else:
            error_message = ldap_response.get('error', 'Не удалось найти студентов')
            
            if 'timeout' in error_message.lower() or 'connection' in error_message.lower():
                response_status = status.HTTP_503_SERVICE_UNAVAILABLE
            else:
                response_status = status.HTTP_400_BAD_REQUEST
                
            return Response({
                'success': False,
                'error': error_message
            }, status=response_status)
            
    except ValueError:
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
