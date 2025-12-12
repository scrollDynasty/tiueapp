import os
from django.conf import settings

def ensure_media_folders():

    media_folders = [
        'news',
        'events',
    ]

    for folder in media_folders:
        folder_path = os.path.join(settings.MEDIA_ROOT, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            print(f"📁 Created media folder: {folder_path}")
        else:
            print(f"✅ Media folder exists: {folder_path}")

def custom_upload_path(instance, filename):

    if hasattr(instance, '__class__'):
        model_name = instance.__class__.__name__.lower()
        if model_name == 'news':
            folder = 'news'
        elif model_name == 'event':
            folder = 'events'
        else:
            folder = 'uploads'
    else:
        folder = 'uploads'

    folder_path = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(folder_path, exist_ok=True)

    return f"{folder}/{filename}"
