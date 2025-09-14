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
            # Reject absolute paths from user input
            if os.path.isabs(path):
                raise Http404("Файл не найден")
            # Безопасное формирование полного пути с нормализацией ".."
            file_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, path))
            # Use realpath to resolve symlinks for robust security
            media_root_realpath = os.path.realpath(settings.MEDIA_ROOT)
            file_path_realpath = os.path.realpath(file_path)
            # Проверяем, что файл реально находится внутри MEDIA_ROOT
            # Гарантируем, что путь безусловно внутри MEDIA_ROOT с учетом разделителя
            if not os.path.exists(file_path_realpath) or not file_path_realpath.startswith(media_root_realpath.rstrip(os.sep) + os.sep):
                raise Http404("Файл не найден")
            
            # Определяем MIME тип
            content_type, _ = mimetypes.guess_type(file_path_realpath)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Читаем файл
            with open(file_path_realpath, 'rb') as f:
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
            filename = os.path.basename(file_path_realpath)
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