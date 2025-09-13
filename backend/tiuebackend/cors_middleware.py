"""
Кастомный CORS middleware для решения проблем с заголовками
"""

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Обрабатываем preflight OPTIONS запросы
        if request.method == 'OPTIONS':
            response = self.handle_preflight(request)
            return response
        
        # Обычный запрос
        response = self.get_response(request)
        
        # Добавляем CORS заголовки к ответу
        response = self.add_cors_headers(response, request)
        
        return response

    def handle_preflight(self, request):
        """Обрабатываем preflight OPTIONS запросы"""
        from django.http import HttpResponse
        
        response = HttpResponse()
        response.status_code = 200
        
        # Добавляем все необходимые CORS заголовки
        response = self.add_cors_headers(response, request)
        
        return response

    def add_cors_headers(self, response, request):
        """Добавляем CORS заголовки к ответу"""
        # Получаем origin из запроса
        origin = request.META.get('HTTP_ORIGIN')

        # Список разрешенных доменов
        allowed_origins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8081',
            'http://127.0.0.1:8081',
            'https://70d07b3756cb.ngrok-free.app',  # Ваш текущий ngrok домен
        ]
        
        # Проверяем ngrok домены (они могут меняться)
        is_ngrok = origin and ('.ngrok-free.app' in origin or '.ngrok.io' in origin)
        
        if origin and (origin in allowed_origins or is_ngrok):
            response['Access-Control-Allow-Origin'] = origin
        else:
            # Для разработки разрешаем все
            response['Access-Control-Allow-Origin'] = '*'
        
        # Разрешаем credentials
        response['Access-Control-Allow-Credentials'] = 'true'
        
        # Разрешаем все методы
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
        
        # Разрешаем ВСЕ заголовки
        requested_headers = request.META.get('HTTP_ACCESS_CONTROL_REQUEST_HEADERS')
        if requested_headers:
            response['Access-Control-Allow-Headers'] = requested_headers
        else:
            # Явно указываем основные заголовки включая cache-control
            response['Access-Control-Allow-Headers'] = (
                'accept, accept-encoding, authorization, content-type, dnt, origin, '
                'user-agent, x-csrftoken, x-requested-with, cache-control, pragma, '
                'expires, if-modified-since, x-forwarded-for, x-forwarded-proto'
            )
        
        # Устанавливаем время кеширования preflight запросов
        response['Access-Control-Max-Age'] = '86400'  # 24 часа
        
        return response