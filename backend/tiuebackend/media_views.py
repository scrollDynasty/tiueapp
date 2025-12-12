import os
import mimetypes
from django.http import HttpResponse, Http404
from django.views import View
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class MediaServeView(View):

    def get(self, request, path):

        file_path = os.path.join(settings.MEDIA_ROOT, path)

        if not os.path.exists(file_path):
            raise Http404("Media file not found")

        file_path = os.path.abspath(file_path)
        media_root = os.path.abspath(settings.MEDIA_ROOT)
        if not file_path.startswith(media_root):
            raise Http404("Invalid path")

        content_type = self.get_content_type(file_path)

        try:
            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=content_type)

                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = '*'

                response['Cache-Control'] = 'public, max-age=86400'

                response['ngrok-skip-browser-warning'] = 'true'

                filename = os.path.basename(file_path)
                response['Content-Disposition'] = f'inline; filename="{filename}"'

                return response

        except IOError:
            raise Http404("Unable to read file")

    def get_content_type(self, file_path):

        content_type, _ = mimetypes.guess_type(file_path)

        if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            try:
                with open(file_path, 'rb') as f:
                    header = f.read(10)

                    if header.startswith(b'\x89PNG\r\n\x1a\n'):
                        return 'image/png'

                    elif header.startswith(b'\xff\xd8\xff'):
                        return 'image/jpeg'

                    elif header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
                        return 'image/gif'

                    elif header.startswith(b'RIFF') and b'WEBP' in header:
                        return 'image/webp'
            except (IOError, IndexError):
                pass

        return content_type or 'application/octet-stream'

    def options(self, request, path):

        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        return response
