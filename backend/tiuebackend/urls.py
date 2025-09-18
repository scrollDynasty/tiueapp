"""
URL configuration for tiuebackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    # LDAP авторизация - основной источник аутентификации
    path('api/auth/', include('authentication.urls')),
    # Остальные endpoints для совместимости и локальных данных
    path('api/', include('news.urls')),
    path('api/users/', include('users.urls')),
    path('api/groups/', include('groups.urls')),
    path('api/schedule/', include('schedule.urls')),
]

# Serve media files через кастомный view с правильными MIME типами
from tiuebackend.media_views import MediaServeView
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', MediaServeView.as_view()),
]

# Media files обрабатываются выше через re_path
