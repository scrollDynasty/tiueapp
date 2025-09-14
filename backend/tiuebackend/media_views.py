"""
Кастомные views для обслуживания медиа файлов с CORS заголовками
"""
import os
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import mimetypes


class CORSMediaView(View):
    """
    Кастомный view для обслуживания медиа файлов с CORS заголовками
    """
    
    def get(self, request, path):
        """Обслуживает медиа файлы с CORS заголовками"""
        try:
            # Полный путь к файлу
            file_path = os.path.join(settings.MEDIA_ROOT, path)
            
            # Безопасно нормализуем путь и проверяем, что файл находится в MEDIA_ROOT
            media_root_abspath = os.path.abspath(settings.MEDIA_ROOT)
            file_path_abspath = os.path.abspath(file_path)
            if not os.path.exists(file_path_abspath) or os.path.commonpath([file_path_abspath, media_root_abspath]) != media_root_abspath:
                raise Http404("Файл не найден")
            
            # Определяем MIME тип
            content_type, _ = mimetypes.guess_type(file_path_abspath)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Читаем файл
            with open(file_path_abspath, 'rb') as f:
                file_content = f.read()
            
            # Создаем ответ
            response = HttpResponse(file_content, content_type=content_type)
            
            # Добавляем CORS заголовки
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, cache-control, pragma, expires, if-modified-since'
            response['Access-Control-Max-Age'] = '86400'
            
            # Добавляем заголовки для кэширования
            response['Cache-Control'] = 'public, max-age=3600'
            
            # Добавляем content disposition для корректного отображения
            filename = os.path.basename(file_path_abspath)
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            
            return response
            
        except Exception as e:
            print(f"Ошибка при обслуживании медиа файла {path}: {e}")
            raise Http404("Файл не найден")
    
    def options(self, request, path):
        """Обрабатываем OPTIONS запросы для CORS"""
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with, cache-control, pragma, expires, if-modified-since'
        response['Access-Control-Max-Age'] = '86400'
        return response