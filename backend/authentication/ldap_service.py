import requests
import json
import logging
from django.conf import settings
from typing import Dict, Any, Optional, Tuple
import urllib3

# Отключаем предупреждения о SSL сертификатах
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)

class LDAPService:
    """
    Сервис для работы с LDAP API
    Проксирует запросы к внешнему LDAP серверу
    """
    
    def __init__(self):
        # Базовый URL LDAP API
        self.base_url = getattr(settings, 'LDAP_BASE_URL', 'https://my.tiue.uz')
        
        # Endpoints
        self.endpoints = {
            'login': '/mobile/login',
            'refresh': '/mobile/refresh',
            'profile': '/mobile/data-student-profile',
            'courses': '/mobile/active-course-list',
            'grades': '/mobile/course-grades-list',
            'attendance': '/mobile/course-attendance-list',
            'messages': '/mobile/messages-list',
            'image': '/mobile/img',
        }
        
        # Таймаут для запросов
        self.timeout = 30

    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, 
                     headers: Dict = None, params: Dict = None) -> Tuple[bool, Dict]:
        """
        Выполняет запрос к LDAP API
        
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        url = f"{self.base_url}{endpoint}"
        
        # Базовые заголовки
        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'TIUE-Mobile-Backend/1.0',
        }
        
        if headers:
            default_headers.update(headers)
        
        try:
            logger.info(f"LDAP API Request: {method} {url}")
            
            if method.upper() == 'GET':
                response = requests.get(
                    url, 
                    headers=default_headers, 
                    params=params, 
                    timeout=self.timeout,
                    verify=False  # Отключаем проверку SSL сертификата
                )
            elif method.upper() == 'POST':
                response = requests.post(
                    url, 
                    headers=default_headers, 
                    json=data, 
                    params=params, 
                    timeout=self.timeout,
                    verify=False  # Отключаем проверку SSL сертификата
                )
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return False, {'error': 'Unsupported HTTP method'}
            
            logger.info(f"LDAP API Response: {response.status_code}")
            
            # Проверяем статус ответа
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    return True, response_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to decode JSON response: {e}")
                    return False, {'error': 'Invalid JSON response from LDAP server'}
            else:
                try:
                    error_data = response.json()
                    logger.warning(f"LDAP API Error {response.status_code}: {error_data}")
                    return False, error_data
                except json.JSONDecodeError:
                    logger.error(f"LDAP API Error {response.status_code}: {response.text}")
                    return False, {'error': f'HTTP {response.status_code}', 'details': response.text}
                    
        except requests.exceptions.Timeout:
            logger.error("LDAP API request timeout")
            return False, {'error': 'Request timeout'}
        except requests.exceptions.ConnectionError:
            logger.error("LDAP API connection error")
            return False, {'error': 'Connection error'}
        except requests.exceptions.RequestException as e:
            logger.error(f"LDAP API request error: {e}")
            return False, {'error': 'Request failed'}

    def login(self, username: str, password: str) -> Tuple[bool, Dict]:
        """
        Авторизация в LDAP
        
        Args:
            username: Имя пользователя (например, U22312)
            password: Пароль
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        data = {
            'username': username,
            'password': password
        }
        
        logger.info(f"LDAP login attempt for user: {username}")
        success, response = self._make_request(
            self.endpoints['login'], 
            method='POST', 
            data=data
        )
        
        if success:
            logger.info(f"LDAP login successful for user: {username}")
        else:
            logger.warning(f"LDAP login failed for user: {username}")
            
        return success, response

    def refresh_token(self, refresh_token: str) -> Tuple[bool, Dict]:
        """
        Обновление access токена
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        data = {
            'refresh_token': refresh_token
        }
        
        logger.info("LDAP token refresh attempt")
        success, response = self._make_request(
            self.endpoints['refresh'], 
            method='POST', 
            data=data
        )
        
        if success:
            logger.info("LDAP token refresh successful")
        else:
            logger.warning("LDAP token refresh failed")
            
        return success, response

    def get_user_profile(self, access_token: str) -> Tuple[bool, Dict]:
        """
        Получение профиля пользователя
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info("LDAP get user profile")
        success, response = self._make_request(
            self.endpoints['profile'], 
            method='POST',  # Согласно документации это POST
            headers=headers
        )
        
        return success, response

    def get_active_courses(self, access_token: str, lang: str = 'en', 
                          page: int = 1, page_size: int = 10) -> Tuple[bool, Dict]:
        """
        Получение активных курсов
        
        Args:
            access_token: Access token
            lang: Язык (en/ru)
            page: Номер страницы
            page_size: Размер страницы
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        params = {
            'lang': lang,
            'page': page,
            'pageSize': page_size,
            'skip': (page - 1) * page_size,
            'take': page_size,
        }
        
        logger.info(f"LDAP get active courses (page={page}, size={page_size})")
        success, response = self._make_request(
            self.endpoints['courses'], 
            method='GET',
            headers=headers,
            params=params
        )
        
        return success, response

    def get_course_grades(self, access_token: str) -> Tuple[bool, Dict]:
        """
        Получение оценок по курсам
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info("LDAP get course grades")
        success, response = self._make_request(
            self.endpoints['grades'], 
            method='GET',
            headers=headers
        )
        
        return success, response

    def get_course_attendance(self, access_token: str) -> Tuple[bool, Dict]:
        """
        Получение данных о посещаемости
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info("LDAP get course attendance")
        success, response = self._make_request(
            self.endpoints['attendance'], 
            method='GET',
            headers=headers
        )
        
        return success, response

    def get_messages(self, access_token: str) -> Tuple[bool, Dict]:
        """
        Получение сообщений
        
        Args:
            access_token: Access token
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        logger.info("LDAP get messages")
        success, response = self._make_request(
            self.endpoints['messages'], 
            method='POST',  # Согласно документации это POST
            headers=headers
        )
        
        return success, response

    def upload_image(self, access_token: str, image_data) -> Tuple[bool, Dict]:
        """
        Загрузка изображения
        
        Args:
            access_token: Access token
            image_data: Данные изображения
            
        Returns:
            Tuple[bool, Dict]: (success, response_data)
        """
        headers = {
            'Authorization': f'Bearer {access_token}'
            # Content-Type будет установлен автоматически для multipart
        }
        
        logger.info("LDAP upload image")
        
        # Для загрузки файлов используем отдельный метод
        url = f"{self.base_url}{self.endpoints['image']}"
        
        try:
            response = requests.post(
                url,
                headers=headers,
                files=image_data,  # Для multipart/form-data
                timeout=self.timeout,
                verify=False  # Отключаем проверку SSL сертификата
            )
            
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    return True, response_data
                except json.JSONDecodeError:
                    return False, {'error': 'Invalid JSON response'}
            else:
                try:
                    error_data = response.json()
                    return False, error_data
                except json.JSONDecodeError:
                    return False, {'error': f'HTTP {response.status_code}'}
                    
        except requests.exceptions.RequestException as e:
            logger.error(f"LDAP image upload error: {e}")
            return False, {'error': 'Upload failed'}


# Singleton instance
ldap_service = LDAPService()
