from django.core.management.base import BaseCommand
from django.conf import settings
from users.models import CustomUser, Admin

class Command(BaseCommand):
    help = 'Создает администратора по умолчанию, если он не существует'

    def handle(self, *args, **options):
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        admin_password = settings.DEFAULT_ADMIN_PASSWORD
        admin_name = settings.DEFAULT_ADMIN_NAME
        
        # Проверяем, существует ли администратор
        if CustomUser.objects.filter(role='admin').exists():
            self.stdout.write(
                self.style.WARNING('Администратор уже существует')
            )
            return
        
        # Создаем пользователя-администратора
        admin_user = CustomUser.objects.create_user(
            username='admin',
            email=admin_email,
            password=admin_password,
            first_name=admin_name,
            last_name='',
            role='admin',
            is_staff=True,
            is_superuser=True
        )
        
        # Создаем профиль администратора
        Admin.objects.create(
            user=admin_user,
            permissions=['all']
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Администратор создан успешно!\n'
                f'Email: {admin_email}\n'
                f'Пароль: {admin_password}'
            )
        )
