from django.contrib.auth import authenticate
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from users.serializers import CustomUserSerializer

@csrf_exempt
def test_api(request):
    """Простая тестовая функция"""
    return JsonResponse({'status': 'ok', 'message': 'API работает!'})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Аутентификация пользователя
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    print(f"Login attempt - Email: {email}, Password length: {len(password) if password else 0}")
    
    if not email or not password:
        return Response({
            'success': False,
            'error': 'Email и пароль обязательны'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Попробуем найти пользователя по email или username
    user = None
    try:
        from users.models import CustomUser
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        try:
            user = CustomUser.objects.get(username=email)
        except CustomUser.DoesNotExist:
            print(f"User not found for: {email}")
    
    if user:
        if user.check_password(password):
            if not user.is_active:
                return Response({
                    'success': False,
                    'error': 'Аккаунт заблокирован'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Создаем или получаем токен
            token, created = Token.objects.get_or_create(user=user)
            print(f"Token for {user.email}: {token.key} (created: {created})")
            
            response_data = {
                'success': True,
                'data': {
                    'user': CustomUserSerializer(user).data,
                    'token': token.key
                }
            }
            print(f"Login response: {response_data}")
            
            return Response(response_data)
        else:
            print("Password is incorrect")
    
    return Response({
        'success': False,
        'error': 'Неверный email или пароль'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Выход из системы
    """
    try:
        # Удаляем токен пользователя если он существует
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
            print(f"Token deleted for user: {request.user.email}")
        else:
            print(f"No token found for user: {request.user.email}")
        
        return Response({
            'success': True,
            'message': 'Успешный выход из системы'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error during logout: {str(e)}")
        # Возвращаем успех даже при ошибке, так как локально пользователь все равно выйдет
        return Response({
            'success': True,
            'message': 'Выход из системы'
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Получение информации о текущем пользователе
    """
    return Response({
        'success': True,
        'data': CustomUserSerializer(request.user).data
    })
