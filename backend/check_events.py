#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiuebackend.settings')
django.setup()

from news.models import Event

print('Events in database:')
for event in Event.objects.all():
    print(f'- {event.id}: {event.title} at {event.location} on {event.date} {event.time}')
print(f'Total events count: {Event.objects.count()}')
