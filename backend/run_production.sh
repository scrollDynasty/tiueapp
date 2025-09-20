#!/bin/bash

# Скрипт для запуска Django в продакшн режиме через ngrok

echo "🚀 Запуск Django в продакшн режиме для ngrok..."

# Переходим в директорию backend
cd "$(dirname "$0")"

# Устанавливаем переменные окружения для продакшн
export DEBUG=False
export DJANGO_SETTINGS_MODULE=tiuebackend.settings

echo "📝 Проверяем миграции..."
python manage.py makemigrations --check --dry-run

echo "🔄 Применяем миграции..."
python manage.py migrate

echo "📊 Собираем статические файлы..."
python manage.py collectstatic --noinput

echo "👤 Создаем суперпользователя (если не существует)..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@tiue.uz').exists():
    User.objects.create_superuser(
        email='admin@tiue.uz',
        password='admin123',
        first_name='Администратор',
        last_name='Системы'
    )
    print('✅ Суперпользователь создан: admin@tiue.uz / admin123')
else:
    print('ℹ️  Суперпользователь уже существует')
"

echo "🌐 Запуск Django сервера на порту 8000..."
echo "🔗 Убедитесь, что ngrok запущен: ngrok http 8000"
echo "📱 Frontend должен использовать ngrok URL в продакшн режиме"
echo ""
echo "🎯 Доступные эндпоинты:"
echo "   • API: https://e61fbe15db44.ngrok-free.app/api/"
echo "   • Admin: https://e61fbe15db44.ngrok-free.app/admin/"
echo "   • Media: https://e61fbe15db44.ngrok-free.app/media/"
echo ""
echo "📱 Для переключения фронтенда на продакшн:"
echo "   1. Откройте config/environment.ts"
echo "   2. Установите forceProduction = true"
echo "   3. Обновите URL при необходимости"
echo ""

# Запускаем сервер с настройками для продакшн
python manage.py runserver 0.0.0.0:8000