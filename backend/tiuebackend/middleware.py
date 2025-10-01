import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Логируем только ошибки API endpoints (4xx, 5xx)
        if request.path.startswith('/api/') and response.status_code >= 400:
            logger.warning(f"{request.method} {request.get_full_path()} - {response.status_code}")
        
        return response
