from django.contrib.auth import authenticate
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from users.serializers import CustomUserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Аутентификация пользователя
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
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
            pass
    
    if user and user.check_password(password):
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
