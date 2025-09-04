#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiuebackend.settings')
django.setup()

from news.models import News

print('News in database:')
for news in News.objects.all():
    print(f'- {news.id}: {news.title} (by {news.author})')
print(f'Total news count: {News.objects.count()}')
