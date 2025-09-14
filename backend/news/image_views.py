from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
import os
import mimetypes


@method_decorator(csrf_exempt, name='dispatch')
class ImageProxyView(View):
    """
    Proxy view для обслуживания изображений через API с правильными CORS заголовками
    """
    
    def get(self, request, category, filename):
        """
        Возвращает изображение по пути /api/image-proxy/{category}/{filename}
        category: 'news' или 'events'
        filename: имя файла изображения
        """
        # Проверяем валидность категории
        if category not in ['news', 'events']:
            raise Http404("Invalid category")
        
        # Построим путь к файлу
        # Построим и нормализуем путь к файлу
        file_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, category, filename))
        abs_file_path = os.path.abspath(file_path)
        
        # Проверяем безопасность пути (предотвращаем path traversal)
        media_root_abs = os.path.abspath(settings.MEDIA_ROOT)
        if not abs_file_path.startswith(media_root_abs + os.sep):
            raise Http404("Invalid path")
        
        # Проверяем существование файла
        if not os.path.exists(abs_file_path):
            raise Http404("Image not found")
        
        # Определяем MIME тип
        content_type, _ = mimetypes.guess_type(abs_file_path)
        if not content_type:
            content_type = 'application/octet-stream'
        
        try:
            # Читаем файл и возвращаем как HTTP ответ
            with open(abs_file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=content_type)
                
                # Добавляем CORS заголовки
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = '*'
                
                # Добавляем заголовки кэширования
                response['Cache-Control'] = 'public, max-age=86400'  # 24 часа
                
                return response
                
        except IOError:
            raise Http404("Unable to read image")
    
    def options(self, request, category, filename):
        """Обработка CORS preflight запросов"""
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        return response