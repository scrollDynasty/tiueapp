#!/usr/bin/env python
"""
Скрипт для создания новостей и событий в TIUE приложении
Использование: python create_content.py
"""

import os
import sys
import django
from django.core.files import File
from django.core.files.base import ContentFile
from datetime import datetime

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tiuebackend.settings')
django.setup()

from news.models import News, Event
from django.contrib.auth import get_user_model

User = get_user_model()

class ContentCreator:
    def __init__(self):
        # Получаем администратора
        print("Поиск администратора...")
        
        # Сначала ищем по роли admin
        try:
            self.admin_user = User.objects.filter(role='admin').first()
            print(f"Найден admin по роли: {self.admin_user}")
        except Exception as e:
            print(f"Ошибка поиска по роли: {e}")
            self.admin_user = None
        
        # Если не найден, ищем суперпользователя
        if not self.admin_user:
            try:
                self.admin_user = User.objects.filter(is_superuser=True).first()
                print(f"Найден суперпользователь: {self.admin_user}")
                
                # Устанавливаем роль admin если её нет
                if self.admin_user and not hasattr(self.admin_user, 'role'):
                    self.admin_user.role = 'admin'
                    self.admin_user.save()
                    print("Установлена роль admin")
            except Exception as e:
                print(f"Ошибка поиска суперпользователя: {e}")
                self.admin_user = None
        
        # Если всё ещё не найден, показываем всех пользователей
        if not self.admin_user:
            print("Все пользователи в базе:")
            try:
                all_users = User.objects.all()
                for user in all_users:
                    print(f"  - {user.username} (email: {user.email}, superuser: {user.is_superuser})")
                
                if all_users.exists():
                    # Берем первого найденного пользователя
                    self.admin_user = all_users.first()
                    print(f"Используем первого пользователя: {self.admin_user.username}")
                else:
                    print("❌ Пользователи не найдены! Создайте суперпользователя:")
                    print("python manage.py createsuperuser")
                    sys.exit(1)
            except Exception as e:
                print(f"❌ Ошибка работы с базой данных: {e}")
                sys.exit(1)
        
        print(f"✅ Используем пользователя: {self.admin_user.username}")

    def create_news(self, title, subtitle, content, image_path=None, category="announcement", icon="megaphone-outline", is_important=False):
        """Создает новость"""
        try:
            news = News.objects.create(
                title=title,
                subtitle=subtitle,
                content=content,
                author=self.admin_user,
                category=category,
                icon=icon,
                is_important=is_important
            )
            
            # Добавляем изображение если указан путь
            if image_path and os.path.exists(image_path):
                with open(image_path, 'rb') as img_file:
                    django_file = File(img_file)
                    filename = os.path.basename(image_path)
                    news.image.save(filename, django_file, save=True)
                print(f"📸 Изображение добавлено: {news.image.url}")
            
            print(f"✅ Новость создана: ID={news.id}, Заголовок='{news.title}'")
            return news
            
        except Exception as e:
            print(f"❌ Ошибка создания новости: {e}")
            return None

    def create_event(self, title, description, location, date, time, image_path=None, category="university", max_participants=None):
        """Создает событие"""
        try:
            event = Event.objects.create(
                title=title,
                description=description,
                location=location,
                date=date,
                time=time,
                category=category,
                created_by=self.admin_user,
                max_participants=max_participants
            )
            
            # Добавляем изображение если указан путь
            if image_path and os.path.exists(image_path):
                with open(image_path, 'rb') as img_file:
                    django_file = File(img_file)
                    filename = os.path.basename(image_path)
                    event.image.save(filename, django_file, save=True)
                print(f"📸 Изображение добавлено: {event.image.url}")
            
            print(f"✅ Событие создано: ID={event.id}, Заголовок='{event.title}'")
            return event
            
        except Exception as e:
            print(f"❌ Ошибка создания события: {e}")
            return None

    def delete_news(self, news_id=None, title=None):
        """Удаляет новость по ID или заголовку"""
        try:
            if news_id:
                news = News.objects.filter(id=news_id).first()
            elif title:
                news = News.objects.filter(title__icontains=title).first()
            else:
                print("❌ Укажите ID или заголовок новости")
                return False
            
            if news:
                title_backup = news.title
                news.delete()
                print(f"✅ Новость удалена: '{title_backup}'")
                return True
            else:
                print("❌ Новость не найдена")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка удаления новости: {e}")
            return False

    def delete_event(self, event_id=None, title=None):
        """Удаляет событие по ID или заголовку"""
        try:
            if event_id:
                event = Event.objects.filter(id=event_id).first()
            elif title:
                event = Event.objects.filter(title__icontains=title).first()
            else:
                print("❌ Укажите ID или заголовок события")
                return False
            
            if event:
                title_backup = event.title
                event.delete()
                print(f"✅ Событие удалено: '{title_backup}'")
                return True
            else:
                print("❌ Событие не найдено")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка удаления события: {e}")
            return False

    def list_all(self):
        """Показывает все новости и события"""
        print("\n📰 НОВОСТИ:")
        for news in News.objects.all():
            print(f"  ID={news.id}: {news.title} (автор: {news.author.username})")
        
        print("\n📅 СОБЫТИЯ:")
        for event in Event.objects.all():
            print(f"  ID={event.id}: {event.title} (создатель: {event.created_by.username})")

def main():
    creator = ContentCreator()
    
    print("\n🎯 TIUE Content Creator")
    print("=" * 50)
    
    while True:
        print("\nВыберите действие:")
        print("1. Создать новость")
        print("2. Создать событие")
        print("3. Удалить новость")
        print("4. Удалить событие")
        print("5. Показать все записи")
        print("6. Выход")
        
        choice = input("\nВведите номер (1-6): ").strip()
        
        if choice == "1":
            # Создание новости
            title = input("Заголовок новости: ").strip()
            subtitle = input("Подзаголовок: ").strip()
            content = input("Содержание: ").strip()
            image_path = input("Путь к изображению (или Enter для пропуска): ").strip()
            
            category = input("Категория (announcement/academic/sports/culture/other) [announcement]: ").strip() or "announcement"
            icon = input("Иконка (megaphone-outline/school-outline/trophy-outline/people-outline/calendar-outline) [megaphone-outline]: ").strip() or "megaphone-outline"
            is_important = input("Важная новость? (y/n) [n]: ").strip().lower() == 'y'
            
            if title and subtitle and content:
                creator.create_news(title, subtitle, content, image_path or None, category, icon, is_important)
            else:
                print("❌ Заполните все обязательные поля!")
                
        elif choice == "2":
            # Создание события
            title = input("Название события: ").strip()
            description = input("Описание: ").strip()
            location = input("Место проведения: ").strip()
            date = input("Дата (YYYY-MM-DD): ").strip()
            time = input("Время (HH:MM): ").strip()
            image_path = input("Путь к изображению (или Enter для пропуска): ").strip()
            
            category = input("Категория (university/academic/sports/cultural/social/club/other) [university]: ").strip() or "university"
            max_participants = input("Максимум участников (или Enter для неограниченного): ").strip()
            max_participants = int(max_participants) if max_participants.isdigit() else None
            
            if title and description and location and date and time:
                creator.create_event(title, description, location, date, time, image_path or None, category, max_participants)
            else:
                print("❌ Заполните все обязательные поля!")
                
        elif choice == "3":
            # Удаление новости
            creator.list_all()
            news_id = input("\nВведите ID новости для удаления: ").strip()
            if news_id.isdigit():
                creator.delete_news(news_id=int(news_id))
            else:
                title = input("Или введите часть заголовка: ").strip()
                if title:
                    creator.delete_news(title=title)
                    
        elif choice == "4":
            # Удаление события
            creator.list_all()
            event_id = input("\nВведите ID события для удаления: ").strip()
            if event_id.isdigit():
                creator.delete_event(event_id=int(event_id))
            else:
                title = input("Или введите часть названия: ").strip()
                if title:
                    creator.delete_event(title=title)
                    
        elif choice == "5":
            # Показать все записи
            creator.list_all()
            
        elif choice == "6":
            print("👋 До свидания!")
            break
            
        else:
            print("❌ Неверный выбор!")

if __name__ == "__main__":
    main()
