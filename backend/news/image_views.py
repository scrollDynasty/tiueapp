from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings
import os
import mimetypes

@method_decorator(csrf_exempt, name='dispatch')
class ImageProxyView(View):

    def get(self, request, category, filename):

        if category not in ['news', 'events']:
            raise Http404("Invalid category")

        file_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, category, filename))
        abs_file_path = os.path.abspath(file_path)

        media_root_abs = os.path.abspath(settings.MEDIA_ROOT)
        if not abs_file_path.startswith(media_root_abs + os.sep):
            raise Http404("Invalid path")

        if not os.path.exists(abs_file_path):
            raise Http404("Image not found")

        content_type, _ = mimetypes.guess_type(abs_file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        try:

            with open(abs_file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type=content_type)

                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = '*'

                response['Cache-Control'] = 'public, max-age=86400'

                response['ngrok-skip-browser-warning'] = 'true'

                return response

        except IOError:
            raise Http404("Unable to read image")

    def options(self, request, category, filename):

        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        return response
