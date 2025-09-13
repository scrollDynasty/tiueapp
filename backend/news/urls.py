from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsViewSet, EventViewSet
from .image_views import ImageProxyView

router = DefaultRouter()
router.register(r'news', NewsViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('image-proxy/<str:category>/<str:filename>', ImageProxyView.as_view(), name='image-proxy'),
]
