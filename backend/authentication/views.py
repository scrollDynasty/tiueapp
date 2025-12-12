

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .ldap_service import ldap_service
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def test_api(request):

    return JsonResponse({
        'status': 'ok',
        'message': 'LDAP API работает!',
        'version': '2.0'
    })

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_login(request):

    username = request.data.get('username')
    password = request.data.get('password')

    logger.info(f"LDAP login attempt - Username: {username}")

    if not username or not password:
        return Response({
            'success': False,
            'error': 'Имя пользователя и пароль обязательны'
        }, status=status.HTTP_400_BAD_REQUEST)

    success, ldap_response = ldap_service.login(username, password)

    if success:
        logger.info(f"LDAP login successful for user: {username}")

        if 'access_token' in ldap_response and 'refresh_token' in ldap_response:

            profile_success, profile_data = ldap_service.get_user_profile(ldap_response['access_token'])

            if profile_success:

                response_data = {
                    'success': True,
                    'data': {
                        'access_token': ldap_response['access_token'],
                        'refresh_token': ldap_response['refresh_token'],
                        'user': profile_data
                    }
                }

                logger.info(f"LDAP login complete with profile for user: {username}")
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Failed to get profile for user: {username}")

                response_data = {
                    'success': True,
                    'data': {
                        'access_token': ldap_response['access_token'],
                        'refresh_token': ldap_response['refresh_token'],
                        'user': None
                    }
                }
                return Response(response_data, status=status.HTTP_200_OK)
        else:
            logger.error(f"Invalid LDAP response format: {ldap_response}")
            return Response({
                'success': False,
                'error': 'Неверный формат ответа от сервера авторизации'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning(f"LDAP login failed for user: {username}")
        error_message = ldap_response.get('error', 'Неверное имя пользователя или пароль')

        if 'timeout' in error_message.lower() or 'connection' in error_message.lower():
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
        else:
            response_status = status.HTTP_401_UNAUTHORIZED

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_refresh_token(request):

    refresh_token = request.data.get('refresh_token')

    if not refresh_token:
        return Response({
            'success': False,
            'error': 'Refresh token обязателен'
        }, status=status.HTTP_400_BAD_REQUEST)

    logger.info("LDAP token refresh attempt")

    success, ldap_response = ldap_service.refresh_token(refresh_token)

    if success:
        logger.info("LDAP token refresh successful")

        if 'access_token' in ldap_response:
            response_data = {
                'success': True,
                'data': {
                    'access_token': ldap_response['access_token'],

                    'refresh_token': ldap_response.get('refresh_token', refresh_token)
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            logger.error(f"Invalid refresh response format: {ldap_response}")
            return Response({
                'success': False,
                'error': 'Неверный формат ответа от сервера'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        logger.warning("LDAP token refresh failed")
        error_message = ldap_response.get('error', 'Не удалось обновить токен')
        return Response({
            'success': False,
            'error': error_message
        }, status=status.HTTP_401_UNAUTHORIZED)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_get_user_profile(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    success, ldap_response = ldap_service.get_user_profile(access_token)

    if success:

        from django.conf import settings
        ldap_base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')

        username = ldap_response.get('uid') or ldap_response.get('username')
        if username:

            avatar_url = f"{ldap_base_url}/mobile/img/{username}"
            ldap_response['avatar'] = avatar_url
            logger.info(f"Avatar URL for {username}: {avatar_url}")

        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP user profile retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить профиль')

        if 'unauthorized' in error_message.lower() or 'token' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def ldap_get_active_courses(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    lang = request.GET.get('lang', 'en')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('pageSize', 100))

    success, ldap_response = ldap_service.get_active_courses(
        access_token, lang, page, page_size
    )

    if success:
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP active courses retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить курсы')

        if 'unauthorized' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def ldap_get_course_grades(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    success, ldap_response = ldap_service.get_course_grades(access_token)

    if success:
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP course grades retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить оценки')

        if 'unauthorized' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def ldap_get_course_attendance(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    success, ldap_response = ldap_service.get_course_attendance(access_token)

    if success:
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP course attendance retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить данные о посещаемости')

        if 'unauthorized' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_get_messages(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    logger.info("LDAP get messages")

    success, ldap_response = ldap_service.get_messages(access_token)

    if success:
        logger.info("LDAP messages retrieved successfully")
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP messages retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить сообщения')

        if 'unauthorized' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_upload_image(request):

    auth_header = request.META.get('HTTP_AUTHORIZATION')

    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)

    access_token = auth_header.split(' ')[1]

    if 'image' not in request.FILES:
        return Response({
            'success': False,
            'error': 'Файл изображения обязателен'
        }, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']

    logger.info("LDAP upload image")

    files = {'image': image_file}

    success, ldap_response = ldap_service.upload_image(access_token, files)

    if success:
        logger.info("LDAP image upload successful")
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP image upload failed")
        error_message = ldap_response.get('error', 'Не удалось загрузить изображение')

        if 'unauthorized' in error_message.lower():
            response_status = status.HTTP_401_UNAUTHORIZED
        else:
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response({
            'success': False,
            'error': error_message
        }, status=response_status)
