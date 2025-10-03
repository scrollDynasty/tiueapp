"""
LDAP Authentication Views
Все методы авторизации работают через внешний LDAP API
"""

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
    """Простая тестовая функция для проверки работы API"""
    return JsonResponse({
        'status': 'ok', 
        'message': 'LDAP API работает!',
        'version': '2.0'
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_login(request):
    """
    LDAP авторизация пользователя
    
    Body:
    {
        "username": "U22312",
        "password": "rustam312"
    }
    
    Response:
    {
        "success": true,
        "data": {
            "access_token": "...",
            "refresh_token": "...",
            "user": {...}
        }
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"LDAP login attempt - Username: {username}")
    
    if not username or not password:
        return Response({
            'success': False,
            'error': 'Имя пользователя и пароль обязательны'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Выполняем авторизацию через LDAP
    success, ldap_response = ldap_service.login(username, password)
    
    if success:
        logger.info(f"LDAP login successful for user: {username}")
        
        # Проверяем, что в ответе есть необходимые токены
        if 'access_token' in ldap_response and 'refresh_token' in ldap_response:
            # Получаем профиль пользователя
            profile_success, profile_data = ldap_service.get_user_profile(ldap_response['access_token'])
            
            if profile_success:
                # Формируем ответ в формате, ожидаемом мобильным приложением
                response_data = {
                    'success': True,
                    'data': {
                        'access_token': ldap_response['access_token'],
                        'refresh_token': ldap_response['refresh_token'],
                        'user': profile_data  # Профиль пользователя из LDAP
                    }
                }
                
                logger.info(f"LDAP login complete with profile for user: {username}")
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Failed to get profile for user: {username}")
                # Возвращаем токены даже если профиль не получен
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
        
        # Определяем статус ответа на основе ошибки
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
    """
    Обновление access токена через LDAP
    
    Body:
    {
        "refresh_token": "..."
    }
    
    Response:
    {
        "success": true,
        "data": {
            "access_token": "...",
            "refresh_token": "..."  // новый refresh token
        }
    }
    """
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response({
            'success': False,
            'error': 'Refresh token обязателен'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    logger.info("LDAP token refresh attempt")
    
    # Обновляем токен через LDAP
    success, ldap_response = ldap_service.refresh_token(refresh_token)
    
    if success:
        logger.info("LDAP token refresh successful")
        
        # Проверяем формат ответа
        if 'access_token' in ldap_response:
            response_data = {
                'success': True,
                'data': {
                    'access_token': ldap_response['access_token'],
                    # Новый refresh_token может быть в ответе
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
    """
    Получение профиля пользователя из LDAP
    Требует Bearer токен в заголовке Authorization
    
    Headers:
    Authorization: Bearer <access_token>
    
    Response:
    {
        "success": true,
        "data": {
            "jshr": "51403056520010",
            "email": "U22312@tiue.uz",
            "full_name": "KARIMOV RUSTAM ZAFAROVICH",
            "group": "RB22-01",
            ...
        }
    }
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    access_token = auth_header.split(' ')[1]
    
    # Получаем профиль через LDAP
    success, ldap_response = ldap_service.get_user_profile(access_token)
    
    if success:
        return Response({
            'success': True,
            'data': ldap_response
        }, status=status.HTTP_200_OK)
    else:
        logger.warning("LDAP user profile retrieval failed")
        error_message = ldap_response.get('error', 'Не удалось получить профиль')
        
        # Если токен невалиден, возвращаем 401
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
    """
    Получение активных курсов из LDAP
    Требует Bearer токен в заголовке Authorization
    
    Headers:
    Authorization: Bearer <access_token>
    
    Query params:
    - lang: en|ru (default: en)
    - page: номер страницы (default: 1)
    - pageSize: размер страницы (default: 10)
    
    Response:
    {
        "success": true,
        "data": {
            "count": 28,
            "data": [
                {
                    "course_id": "107",
                    "course_name": "...",
                    "status": "current|past|future"
                },
                ...
            ]
        }
    }
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    access_token = auth_header.split(' ')[1]
    
    # Параметры запроса
    lang = request.GET.get('lang', 'en')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('pageSize', 100))  # Увеличено до 100 для получения всех курсов
    
    # Получаем курсы через LDAP
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
    """
    Получение оценок по курсам из LDAP
    Требует Bearer токен в заголовке Authorization
    """
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
    """
    Получение данных о посещаемости из LDAP
    Требует Bearer токен в заголовке Authorization
    """
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
    """
    Получение сообщений из LDAP
    Требует Bearer токен в заголовке Authorization
    """
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
    """
    Загрузка изображения в LDAP
    Требует Bearer токен в заголовке Authorization
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'error': 'Bearer токен обязателен'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    access_token = auth_header.split(' ')[1]
    
    # Получаем файл из запроса
    if 'image' not in request.FILES:
        return Response({
            'success': False,
            'error': 'Файл изображения обязателен'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    logger.info("LDAP upload image")
    
    # Подготавливаем данные для загрузки
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