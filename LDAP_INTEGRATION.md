# LDAP Integration Documentation

## 🎯 Обзор

Приложение полностью интегрировано с LDAP API от TIUE. Все данные пользователей, курсов, оценок и посещаемости теперь получаются напрямую из LDAP системы через `https://my.tiue.uz`.

## 🔧 Архитектура

### Backend (Django)
- **Прокси-сервер**: Django работает как прокси между мобильным приложением и LDAP API
- **Без локальной БД пользователей**: Все данные пользователей из LDAP
- **Bearer токены**: Используются JWT токены от LDAP вместо Django Token

### Frontend (React Native)
- **LDAP Auth Service**: Прямое взаимодействие с LDAP API
- **Автоматическое обновление токенов**: При истечении access token
- **Кеширование**: Профиль и курсы кешируются для производительности

## 🔑 Токены

### Access Token
- **Тип**: JWT
- **Время жизни**: 15 минут
- **Использование**: Bearer авторизация для всех запросов

### Refresh Token
- **Время жизни**: 30 дней
- **Обновление**: При refresh получаешь новый access + новый refresh токен

## 📡 API Endpoints

### Авторизация
```
POST /api/auth/login/
Body: {"username": "U22312", "password": "password"}
Response: {"access_token": "...", "refresh_token": "...", "user": {...}}
```

### Обновление токена
```
POST /api/auth/refresh/
Body: {"refresh_token": "..."}
Response: {"access_token": "...", "refresh_token": "..."}
```

### Профиль пользователя
```
POST /api/auth/profile/
Headers: Authorization: Bearer <token>
Response: {"jshr": "...", "full_name": "...", "group": "...", ...}
```

### Активные курсы
```
GET /api/auth/courses/?lang=en&page=1&pageSize=10
Headers: Authorization: Bearer <token>
Response: {"count": 28, "data": [...]}
```

### Оценки
```
GET /api/auth/grades/
Headers: Authorization: Bearer <token>
Response: [...]
```

### Посещаемость
```
GET /api/auth/attendance/
Headers: Authorization: Bearer <token>
Response: [...]
```

### Сообщения
```
POST /api/auth/messages/
Headers: Authorization: Bearer <token>
Response: [...]
```

## 🚀 Запуск

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
npm install
npm start
```

## 🔒 Безопасность

1. **Токены в AsyncStorage**: Все токены безопасно хранятся локально
2. **Автоматическое обновление**: Токены обновляются автоматически при истечении
3. **Bearer авторизация**: Все защищенные запросы используют Bearer токены
4. **Очистка при logout**: Все токены удаляются при выходе

## 📱 Пользовательский опыт

### Авторизация
- Поле **Username** вместо Email (например: U22312)
- Автоматическое преобразование в верхний регистр
- Валидация полей перед отправкой

### Профиль
- Данные загружаются из LDAP в реальном времени
- Кеширование для быстрого доступа
- Автоматическое обновление при изменении токена

### Курсы
- Активные, завершенные и будущие курсы
- Пагинация для больших списков
- Статусы: current, past, future

## 🔄 Обработка ошибок

1. **401 Unauthorized**: Автоматическое обновление токена
2. **503 Service Unavailable**: Сервер LDAP недоступен
3. **Network errors**: Обработка сетевых ошибок
4. **Token refresh failed**: Перенаправление на логин

## 🧪 Тестирование

### Тестовые данные
- **Username**: U22312
- **Password**: rustam312

### Проверка endpoints
```bash
# Тест авторизации
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"U22312","password":"rustam312"}'

# Тест профиля
curl -X POST http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Настройки

### Environment Variables
```bash
# Backend
LDAP_BASE_URL=https://my.tiue.uz
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
# В config/environment.ts
LDAP_BASE_URL=https://my.tiue.uz
```

## 📊 Мониторинг

### Логи Backend
- Все LDAP запросы логируются
- Ошибки авторизации отслеживаются
- Производительность запросов

### Логи Frontend
- Состояние токенов в development режиме
- Ошибки сети и авторизации
- Кеширование данных

## 🔮 Будущие улучшения

1. **Offline режим**: Кеширование критических данных
2. **Push уведомления**: Интеграция с LDAP событиями  
3. **Биометрическая авторизация**: Touch/Face ID для повторного входа
4. **Синхронизация**: Автоматическое обновление данных в фоне

## 🆘 Troubleshooting

### Проблема: Не удается войти
- Проверь правильность username (U22312, не email)
- Убедись что LDAP сервер доступен
- Проверь логи backend на ошибки

### Проблема: Токен не обновляется
- Проверь что refresh_token не истек (30 дней)
- Убедись что LDAP API возвращает новый refresh_token
- Очисти AsyncStorage и войди заново

### Проблема: Нет данных профиля
- Проверь что access_token валидный
- Убедись что LDAP API /mobile/data-student-profile работает
- Проверь Bearer авторизацию в заголовках

## 📞 Поддержка

При возникновении проблем:
1. Проверь логи backend и frontend
2. Убедись что все сервисы запущены
3. Проверь сетевое соединение с my.tiue.uz
4. Очисти кеш приложения если нужно
