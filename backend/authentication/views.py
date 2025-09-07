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
            
            return Response({
                'success': True,
                'data': {
                    'user': CustomUserSerializer(user).data,
                    'token': token.key
                }
            })
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
        request.user.auth_token.delete()
    except Token.DoesNotExist:
        pass
    
    return Response({
        'success': True,
        'message': 'Успешный выход из системы'
    })

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
