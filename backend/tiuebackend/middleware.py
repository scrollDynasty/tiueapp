import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path.startswith('/api/') and response.status_code >= 400:
            logger.warning(f"{request.method} {request.get_full_path()} - {response.status_code}")

        return response
