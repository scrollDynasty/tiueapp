import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Логируем входящий запрос
        logger.info(f"Request: {request.method} {request.get_full_path()}")
        logger.info(f"Headers: {dict(request.headers)}")
        
        if request.method == 'POST':
            logger.info(f"Body: {request.body}")
        
        response = self.get_response(request)
        
        # Логируем ответ
        logger.info(f"Response: {response.status_code}")
        
        return response
