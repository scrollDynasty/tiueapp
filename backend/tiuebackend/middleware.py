import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Логируем входящий запрос только для API endpoints
        if request.path.startswith('/api/'):
            logger.info(f"Request: {request.method} {request.get_full_path()}")
            logger.info(f"Headers: {dict(request.headers)}")
            
            # Не логируем тело запроса для multipart/form-data (содержит изображения)
            if request.method == 'POST' and request.body:
                content_type = request.headers.get('Content-Type', '')
                if 'multipart/form-data' not in content_type:
                    logger.info(f"Body: {request.body}")
                else:
                    logger.info("Body: [multipart/form-data - image upload, content hidden]")
        
        response = self.get_response(request)
        
        # Логируем ответ только для API endpoints  
        if request.path.startswith('/api/'):
            logger.info(f"Response: {response.status_code}")
        
        return response
