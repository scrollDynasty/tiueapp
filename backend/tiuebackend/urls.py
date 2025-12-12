
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('authentication.urls')),

    path('api/', include('news.urls')),
    path('api/users/', include('users.urls')),
    path('api/groups/', include('groups.urls')),
    path('api/schedule/', include('schedule.urls')),
]

from tiuebackend.media_views import MediaServeView
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', MediaServeView.as_view()),
]

