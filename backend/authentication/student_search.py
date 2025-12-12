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

    try:

        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Bearer токен обязателен'
            }, status=status.HTTP_401_UNAUTHORIZED)

        access_token = auth_header.split(' ')[1]

        query = request.GET.get('q', '')
        group = request.GET.get('group')
        limit = int(request.GET.get('limit', 50))

        if not query and not group:
            return Response({
                'success': False,
                'error': 'Необходимо указать хотя бы один параметр поиска'
            }, status=status.HTTP_400_BAD_REQUEST)

        success, ldap_response = ldap_service.search_students(
            access_token,
            query=query if query else None,
            group=group if group else None,
            limit=limit
        )

        if success:
            students = ldap_response.get('students', [])

            for student in students:
                username = student.get('uid', '')
                if username:

                    base_url = settings.BASE_URL
                    avatar_api_url = f"{base_url}/users/avatar/{username}/"

                    try:
                        from users.models import CustomUser
                        from users.views import get_user_avatar_data

                        local_user = CustomUser.objects.filter(username=username).first()
                        if local_user and local_user.avatar:

                            avatar_url = f"{base_url}{local_user.avatar.url}"
                            student['avatar'] = avatar_url
                            logger.debug(f"Local avatar for {username}: {avatar_url}")
                        else:

                            ldap_base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')
                            avatar_url = f"{ldap_base_url}/mobile/img/{username}"
                            student['avatar'] = avatar_url
                            logger.debug(f"LDAP avatar URL for {username}: {avatar_url}")
                    except Exception as e:

                        ldap_base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')
                        student['avatar'] = f"{ldap_base_url}/mobile/img/{username}"
                        logger.error(f"Error getting avatar for {username}: {e}")

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
